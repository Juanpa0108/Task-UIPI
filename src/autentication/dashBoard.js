// dashBoard.js (versión corregida)
// --------- CONFIG ----------
/**
 * Object representing the available task states.
 * Each state contains a human-readable name and a CSS class for styling.
 * @type {Object<string, {name: string, class: string}>}
 */
const taskStates = {
  todo: { name: 'Por hacer', class: 'status-todo' },
  inProgress: { name: 'En proceso', class: 'status-in-progress' },
  done: { name: 'Terminada', class: 'status-done' }
};

/**
 * Key used for saving and loading tasks in localStorage.
 * @type {string}
 */
const STORAGE_KEY = 'tf_tasks_v1';

// --------- GLOBAL VARIABLES ----------
/**
 * Modal element reference.
 * @type {HTMLElement|null}
 */
let modal;
let createTaskBtn, closeModalBtn, cancelModalBtn, saveTaskBtn;
let taskForm;
let taskGroups;
let todoContainer, inProgressContainer, doneContainer;
let tasks = [];

// --------- AUTH & WELCOME ----------
/**
 * Checks if the user is authenticated via URL token or localStorage.
 * Stores the token in localStorage if found in the URL.
 * 
 * @returns {boolean} True if a token is found or assumed; false otherwise.
 */
function checkAuthentication() {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");
  const localToken = localStorage.getItem('authToken');

  if (urlToken) {
    localStorage.setItem('authToken', urlToken);
    return true;
  }
  if (localToken) return true;

  return true;
}
/**
 * Displays a welcome banner message with the stored user name.
 * The banner auto-hides after 5 seconds.
 *
 * @returns {void}
 */
function showWelcomeMessage() {
  const welcomeBanner = document.getElementById('welcomeBanner');
  const welcomeMessage = document.getElementById('welcomeMessage');
  if (!welcomeBanner || !welcomeMessage) return;

  let displayName = localStorage.getItem('userName') || 'Usuario';
  welcomeMessage.textContent = `¡Bienvenido/a, ${displayName}! Has iniciado sesión correctamente.`;
  welcomeBanner.style.display = 'flex';
  setTimeout(closeWelcomeBanner, 5000);
}
/**
 * Hides the welcome banner from the DOM.
 *
 * @function
 * @returns {void}
 */
window.closeWelcomeBanner = function() {
  const welcomeBanner = document.getElementById('welcomeBanner');
  if (welcomeBanner) welcomeBanner.style.display = 'none';
};

// --------- INIT ----------
/**
 * Initializes the dashboard once DOM content has fully loaded.
 * - Verifies authentication
 * - Retrieves and binds DOM elements
 * - Sets event listeners
 * - Loads tasks from API or storage fallback
 * - Shows welcome message
 *
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado, iniciando dashboard...');

  if (!checkAuthentication()) return;

  // DOM elements
  modal = document.getElementById('taskModal');
  createTaskBtn = document.getElementById('createTaskBtn');
  closeModalBtn = document.querySelector('.close-modal');
  cancelModalBtn = document.getElementById('cancelModalBtn');
  saveTaskBtn = document.getElementById('saveTaskBtn');
  taskForm = document.getElementById('taskForm');
  taskGroups = document.getElementById('task-groups');
  todoContainer = document.getElementById('todo-tasks');
  inProgressContainer = document.getElementById('inProgress-tasks');
  doneContainer = document.getElementById('done-tasks');

  if (!taskForm) console.error('No se encontró #taskForm en el HTML');
  if (!todoContainer || !inProgressContainer || !doneContainer) console.error('Faltan contenedores de columnas');

  attachEventListeners();
  loadTasksFromAPI(); // Load from API instead of localStorage
  checkEmptyContainers();
  showWelcomeMessage();
});

/**
 * Attaches all required event listeners for modal, buttons, and UI interactions.
 *
 * @returns {void}
 */
function attachEventListeners() {

    // ---- Validación de límites de caracteres ----
  const titleInput = document.getElementById("taskTitle_0");
  const descInput = document.getElementById("taskDescription_0");

  if (titleInput) {
    const titleWarning = document.createElement("small");
    titleWarning.style.color = "red";
    titleWarning.style.display = "none";
    titleInput.parentNode.appendChild(titleWarning);

    titleInput.addEventListener("input", () => {
      if (titleInput.value.length >= 50) {
        titleWarning.textContent = "⚠️ El título no puede superar los 50 caracteres";
        titleWarning.style.display = "block";
      } else {
        titleWarning.style.display = "none";
      }
    });
  }

  if (descInput) {
    const descWarning = document.createElement("small");
    descWarning.style.color = "red";
    descWarning.style.display = "none";
    descInput.parentNode.appendChild(descWarning);

    descInput.addEventListener("input", () => {
      if (descInput.value.length >= 500) {
        descWarning.textContent = "⚠️ La descripción no puede superar los 500 caracteres";
        descWarning.style.display = "block";
      } else {
        descWarning.style.display = "none";
      }
    });
  }

  if (createTaskBtn) createTaskBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  if (saveTaskBtn) saveTaskBtn.addEventListener('click', (e) => { e.preventDefault(); saveTask(); });

  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.getElementById('sideMenu')?.classList.toggle('open');
    });
  }

  const userIcon = document.querySelector('.user-icon');
  if (userIcon) userIcon.addEventListener('click', () => {
    document.querySelector('.user-menu')?.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    const taskId = taskItem.id;

    if (btn.classList.contains('btn-edit')) {
      openEditForTask(taskId);
    } else if (btn.classList.contains('btn-delete')) {
      deleteTask(taskId);
    } else if (btn.classList.contains('btn-complete')) {
      updateTaskStatusById(taskId, 'done', true);
    } else if (btn.classList.contains('btn-status')) {
      showStatusMenu(taskId, btn);
    }
  });
}

// --------- API CALLS ----------
/**
 * Loads all tasks from the backend API.
 * If the request fails, falls back to localStorage.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadTasksFromAPI() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No hay token de autenticación");
      return;
    }

    const res = await fetch("http://localhost:4000/api/tasks", {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    tasks = data;
    renderAllTasks();
    checkEmptyContainers();
  } catch (err) {
    console.error("Error cargando tareas:", err);
    // Fallback in Localstorage fails the Api
    loadTasksFromStorage();
  }
}

/**
 * Saves a new or existing task to the backend API.
 * If editing, updates the task; otherwise creates a new one.
 *
 * @async
 * @returns {Promise<void>}
 */
async function saveTask() {
  const v = validateForm();
  if (!v.ok) {
    alert(v.message);
    if (v.field) document.getElementById(v.field)?.focus();
    return;
  }

  const { title, description, priority, status, start, end } = v.data;
  const isEditing = taskForm?.getAttribute('data-editing-id');

  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      alert("No se encontró token de autenticación. Por favor, inicia sesión de nuevo.");
      return;
    }

    const taskData = { 
      title, 
      description, 
      priority, 
      status, 
      start, 
      end 
    };

    let url = "http://localhost:4000/api/tasks";
    let method = "POST";

    if (isEditing) {
      url = `http://localhost:4000/api/tasks/${isEditing}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP error! status: ${res.status}`);
    }

    const savedTask = await res.json();

    if (isEditing) {
      // Update existing task
      const idx = tasks.findIndex(t => t._id === isEditing);
      if (idx !== -1) {
        tasks[idx] = savedTask;
      }
    } else {
      // Add new task
      tasks.push(savedTask);
    }

    renderAllTasks();
    closeModal();
    checkEmptyContainers();

  } catch (err) {
    console.error("Error guardando tarea:", err);
    alert("Error al guardar tarea: " + err.message);
  }
}

/**
 * Deletes a task from the backend API and removes it from local state.
 *
 * @async
 * @param {string} taskId - The unique ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
  
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      alert("No se encontró token de autenticación");
      return;
    }

    const res = await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP error! status: ${res.status}`);
    }

    // Remove from the local list
    tasks = tasks.filter(t => t._id !== taskId);
    document.getElementById(taskId)?.remove();
    checkEmptyContainers();

  } catch (err) {
    console.error("Error eliminando tarea:", err);
    alert("Error al eliminar tarea: " + err.message);
  }
}

/**
 * Updates the status of a specific task by ID.
 *
 * @async
 * @param {string} taskId - The unique ID of the task.
 * @param {string} newStatus - The new status to assign to the task.
 * @returns {Promise<void>}
 */
async function updateTaskStatusById(taskId, newStatus) {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      alert("No se encontró token de autenticación");
      return;
    }

    const res = await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP error! status: ${res.status}`);
    }

    const updatedTask = await res.json();
    
    // Actualizar en la lista local
    const idx = tasks.findIndex(t => t._id === taskId);
    if (idx !== -1) {
      tasks[idx] = updatedTask;
    }

    renderAllTasks();
    checkEmptyContainers();

  } catch (err) {
    console.error("Error actualizando estado:", err);
    alert("Error al actualizar estado: " + err.message);
  }
}

// --------- STORAGE (fallback) ----------
/**
 * Loads tasks from localStorage into memory.
 *
 * @returns {void}
 */
function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      tasks = JSON.parse(raw);
      renderAllTasks();
      checkEmptyContainers();
    } else {
      tasks = [];
    }
  } catch (err) {
    console.error('Error leyendo tasks de localStorage', err);
    tasks = [];
  }
}

/**
 * Saves all tasks into localStorage.
 *
 * @returns {void}
 */
function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --------- MODAL & FORM ----------
/**
 * Opens the modal for creating or editing tasks.
 *
 * @returns {void}
 */
function openModal() {
  if (!modal) return;
  
  // Just reset the form if we are not editing
  const isEditing = taskForm?.getAttribute('data-editing-id');
  if (!isEditing) {
    resetTaskForm();
    // Change the modal title for new task
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
      modalTitle.textContent = '📝 Nueva Tarea';
    }
  }
  
  modal.style.display = 'block';
  document.getElementById('taskTitle_0')?.focus();
}

/**
 * Closes the modal and resets edit state.
 *
 * @returns {void}
 */
function closeModal() {
  if (!modal) return;
  modal.style.display = 'none';
  taskForm?.removeAttribute('data-editing-id');
  
  // Reset the title of the Modal
  const modalTitle = document.querySelector('.modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = '📝 Nueva Tarea';
  }
}

/**
 * Resets the task form to default values.
 *
 * @returns {void}
 */
function resetTaskForm() {
  if (!taskForm) return;
  taskForm.reset();
  taskForm.removeAttribute('data-editing-id');
  
  const pr = document.getElementById('taskPriority_0');
  if (pr && !pr.value) pr.value = 'low';
  const st = document.getElementById('taskStatus_0');
  if (st && !st.value) st.value = 'todo';
}


/**
 * Validates the task form fields.
 *
 * @returns {{ok: boolean, message?: string, field?: string, data?: Object}}
 */
function validateForm() {
  if (!taskForm) return { ok: false, message: 'Formulario no encontrado' };
  
  const title = document.getElementById('taskTitle_0')?.value?.trim() || '';
  const description = document.getElementById('taskDescription_0')?.value?.trim() || '';
  const priority = document.getElementById('taskPriority_0')?.value || '';
  const status = document.getElementById('taskStatus_0')?.value || '';
  const start = document.getElementById('taskStart_0')?.value || '';
  const end = document.getElementById('taskEnd_0')?.value || '';

  if (!title) return { ok: false, message: 'El título es obligatorio', field: 'taskTitle_0' };
  if (!title.length > 50) return {ok: false, massage:'El titulo no puede superar los 50 caracteres', fiekd: 'taskTitle_0'}
  if (!description.length > 500) return { ok: false, message: 'La descripción no puede superar 500 caracteres', field: 'taskDescription_0' };
  if (!priority) return { ok: false, message: 'La prioridad es obligatoria', field: 'taskPriority_0' };
  if (!status) return { ok: false, message: 'El estado es obligatorio', field: 'taskStatus_0' };
  if (!start) return { ok: false, message: 'La fecha de inicio es obligatoria', field: 'taskStart_0' };
  if (!end) return { ok: false, message: 'La fecha de cierre es obligatoria', field: 'taskEnd_0' };

  if (new Date(start) > new Date(end)) {
    return { ok: false, message: 'La fecha de inicio no puede ser posterior a la fecha de cierre', field: 'taskStart_0' };
  }

  return { ok: true, data: { title, description, priority, status, start, end } };
}

// --------- RENDER ----------
/**
 * Renders all tasks into their corresponding columns.
 *
 * @returns {void}
 */
function renderAllTasks() {
  if (todoContainer) todoContainer.innerHTML = '';
  if (inProgressContainer) inProgressContainer.innerHTML = '';
  if (doneContainer) doneContainer.innerHTML = '';

  tasks.forEach(task => {
    const el = createTaskElement(task);
    placeTaskInColumn(el, task.status);
  });
  checkEmptyContainers();
}

/**
 * Creates a DOM element for a single task.
 *
 * @param {Object} task - The task object with its properties.
 * @returns {HTMLElement} The task DOM element.
 */

function createTaskElement(task) {
  const item = document.createElement('div');
  item.className = 'task-item';
  // Use _id from Mongodb instead of ID
  item.id = task._id || task.id;

  item.dataset.title = task.title;
  item.dataset.description = task.description;
  item.dataset.priority = task.priority;
  item.dataset.status = task.status;
  item.dataset.start = task.start;
  item.dataset.end = task.end;

  const content = document.createElement('div');
  content.className = 'task-content';

  const info = document.createElement('div');
  info.className = 'task-info';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'task-title';
  titleDiv.textContent = task.title;

  const statusSpan = document.createElement('span');
  statusSpan.className = `task-status ${taskStates[task.status].class}`;
  statusSpan.textContent = taskStates[task.status].name;
  statusSpan.style.marginLeft = '8px';
  titleDiv.appendChild(statusSpan);

  const descDiv = document.createElement('div');
  descDiv.className = 'task-description';
  descDiv.textContent = task.description;

  const datesDiv = document.createElement('div');
  datesDiv.className = 'task-dates';
  
  if (task.start) {
    const p1 = document.createElement('p');
    p1.innerHTML = `<strong>Inicio:</strong> ${new Date(task.start).toLocaleString()}`;
    datesDiv.appendChild(p1);
  }
  if (task.end) {
    const p2 = document.createElement('p');
    p2.innerHTML = `<strong>Cierre:</strong> ${new Date(task.end).toLocaleString()}`;
    datesDiv.appendChild(p2);
  }

  info.appendChild(titleDiv);
  info.appendChild(descDiv);
  info.appendChild(datesDiv);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-edit';
  editBtn.type = 'button';
  editBtn.innerHTML = '✏️ Editar';

  const statusBtn = document.createElement('button');
  statusBtn.className = 'btn-status';
  statusBtn.type = 'button';
  statusBtn.innerHTML = '🔁 Cambiar estado';

  const completeBtn = document.createElement('button');
  completeBtn.className = 'btn-complete';
  completeBtn.type = 'button';
  completeBtn.innerHTML = '✅ Completar';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.type = 'button';
  deleteBtn.innerHTML = '🗑️ Eliminar';

  if (task.status === 'done') completeBtn.style.display = 'none';

  actions.appendChild(editBtn);
  actions.appendChild(statusBtn);
  actions.appendChild(completeBtn);
  actions.appendChild(deleteBtn);

  content.appendChild(info);
  content.appendChild(actions);
  item.appendChild(content);

  return item;
}

/**
 * Places a task element into the correct column based on status.
 *
 * @param {HTMLElement} taskElement - The task DOM element.
 * @param {string} status - The task status ("todo", "inProgress", or "done").
 * @returns {void}
 */
function placeTaskInColumn(taskElement, status) {
  document.querySelectorAll('.task-item').forEach(n => {
    if (n.id === taskElement.id) {
      n.remove();
    }
  });

  if (status === 'todo' && todoContainer) todoContainer.appendChild(taskElement);
  else if (status === 'inProgress' && inProgressContainer) inProgressContainer.appendChild(taskElement);
  else if (status === 'done' && doneContainer) doneContainer.appendChild(taskElement);
  else if (todoContainer) todoContainer.appendChild(taskElement);
}

// --------- EDIT ----------
/**
 * Opens the modal for editing an existing task.
 * Pre-fills the form with task data.
 *
 * @param {string} taskId - The unique ID of the task.
 * @returns {void}
 */
function openEditForTask(taskId) {
  const task = tasks.find(t => (t._id || t.id) === taskId);
  if (!task) return alert('No se encontró la tarea para editar');

  // Fill the form with task data
  document.getElementById('taskTitle_0').value = task.title;
  document.getElementById('taskDescription_0').value = task.description;
  document.getElementById('taskPriority_0').value = task.priority;
  document.getElementById('taskStatus_0').value = task.status;
  
  // format dates for datetime-local
  if (task.start) {
    const startDate = new Date(task.start);
    document.getElementById('taskStart_0').value = startDate.toISOString().slice(0, 16);
  }
  
  if (task.end) {
    const endDate = new Date(task.end);
    document.getElementById('taskEnd_0').value = endDate.toISOString().slice(0, 16);
  }

  // mark that we are editing and establish the ID
  taskForm.setAttribute('data-editing-id', taskId);
  
  // Change the modal title
  const modalTitle = document.querySelector('.modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = '✏️ Editar Tarea';
  }
  
  // Open the Modal
  openModal();
}

// --------- STATUS MENU ----------
/**
 * Displays a dropdown menu to change the task status.
 *
 * @param {string} taskId - The unique ID of the task.
 * @param {HTMLElement} buttonEl - The button triggering the menu.
 * @returns {void}
 */

function showStatusMenu(taskId, buttonEl) {
  document.querySelectorAll('.status-menu').forEach(m => m.remove());

  const menu = document.createElement('div');
  menu.className = 'status-menu';
  menu.style.position = 'absolute';
  menu.style.zIndex = '9999';
  menu.style.background = '#fff';
  menu.style.border = '1px solid #ddd';
  menu.style.padding = '6px';
  menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

  Object.entries(taskStates).forEach(([key, val]) => {
    const opt = document.createElement('div');
    opt.className = 'status-option';
    opt.style.padding = '6px';
    opt.style.cursor = 'pointer';
    opt.textContent = val.name;
    opt.addEventListener('click', () => {
      updateTaskStatusById(taskId, key);
      menu.remove();
    });
    menu.appendChild(opt);
  });

  const rect = buttonEl.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!menu.contains(e.target) && e.target !== buttonEl) {
        menu.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 0);
}

// --------- UTILITIES ----------
/**
 * Checks if task containers are empty and displays a placeholder message if so.
 *
 * @returns {void}
 */
function checkEmptyContainers() {
  function check(container, message) {
    if (!container) return;
    const has = container.querySelectorAll('.task-item').length > 0;
    if (!has) {
      if (!container.querySelector('.no-tasks')) {
        container.innerHTML = `<div class="no-tasks">${message}</div>`;
      }
    } else {
      const no = container.querySelector('.no-tasks');
      if (no) no.remove();
    }
  }
  check(todoContainer, 'No hay tareas pendientes');
  check(inProgressContainer, 'No hay tareas en progreso');
  check(doneContainer, 'No hay tareas completadas');
}