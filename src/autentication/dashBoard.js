// dashBoard.js (versión corregida)
// --------- CONFIG ----------
const taskStates = {
  todo: { name: 'Por hacer', class: 'status-todo' },
  inProgress: { name: 'En proceso', class: 'status-in-progress' },
  done: { name: 'Terminada', class: 'status-done' }
};

// Storage key
const STORAGE_KEY = 'tf_tasks_v1';

// --------- VARIABLES GLOBALES ----------
let modal;
let createTaskBtn, closeModalBtn, cancelModalBtn, saveTaskBtn;
let taskForm;
let taskGroups;
let todoContainer, inProgressContainer, doneContainer;
let tasks = [];

// --------- AUTH & WELCOME ----------
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

function showWelcomeMessage() {
  const welcomeBanner = document.getElementById('welcomeBanner');
  const welcomeMessage = document.getElementById('welcomeMessage');
  if (!welcomeBanner || !welcomeMessage) return;

  let displayName = localStorage.getItem('userName') || 'Usuario';
  welcomeMessage.textContent = `¡Bienvenido/a, ${displayName}! Has iniciado sesión correctamente.`;
  welcomeBanner.style.display = 'flex';
  setTimeout(closeWelcomeBanner, 5000);
}

window.closeWelcomeBanner = function() {
  const welcomeBanner = document.getElementById('welcomeBanner');
  if (welcomeBanner) welcomeBanner.style.display = 'none';
};

// --------- INIT ----------
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
  loadTasksFromAPI(); // Cargar desde API en lugar de localStorage
  checkEmptyContainers();
  showWelcomeMessage();
});

function attachEventListeners() {
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
    // Fallback a localStorage si falla la API
    loadTasksFromStorage();
  }
}

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
    const userId = localStorage.getItem("userId");
    
    // Si no hay userId, usar el token para obtener info del usuario
    if (!userId && !token) {
      alert("No se encontró información de usuario. Por favor, inicia sesión de nuevo.");
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

    // Solo incluir userId si existe
    if (userId) {
      taskData.user = userId;
    }

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
      // Actualizar tarea existente
      const idx = tasks.findIndex(t => t._id === isEditing);
      if (idx !== -1) {
        tasks[idx] = savedTask;
      }
    } else {
      // Agregar nueva tarea
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

async function deleteTask(taskId) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
  
  try {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Remover de la lista local
    tasks = tasks.filter(t => t._id !== taskId);
    document.getElementById(taskId)?.remove();
    checkEmptyContainers();

  } catch (err) {
    console.error("Error eliminando tarea:", err);
    alert("Error al eliminar tarea: " + err.message);
  }
}

async function updateTaskStatusById(taskId, newStatus) {
  try {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
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

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --------- MODAL & FORM ----------
function openModal() {
  if (!modal) return;
  resetTaskForm();
  modal.style.display = 'block';
  document.getElementById('taskTitle_0')?.focus();
}

function closeModal() {
  if (!modal) return;
  modal.style.display = 'none';
  taskForm?.removeAttribute('data-editing-id');
}

function resetTaskForm() {
  if (!taskForm) return;
  taskForm.reset();
  taskForm.removeAttribute('data-editing-id');
  
  const pr = document.getElementById('taskPriority_0');
  if (pr && !pr.value) pr.value = 'low';
  const st = document.getElementById('taskStatus_0');
  if (st && !st.value) st.value = 'todo';
}

function validateForm() {
  if (!taskForm) return { ok: false, message: 'Formulario no encontrado' };
  
  const title = document.getElementById('taskTitle_0')?.value?.trim() || '';
  const description = document.getElementById('taskDescription_0')?.value?.trim() || '';
  const priority = document.getElementById('taskPriority_0')?.value || '';
  const status = document.getElementById('taskStatus_0')?.value || '';
  const start = document.getElementById('taskStart_0')?.value || '';
  const end = document.getElementById('taskEnd_0')?.value || '';

  if (!title) return { ok: false, message: 'El título es obligatorio', field: 'taskTitle_0' };
  if (!description) return { ok: false, message: 'La descripción es obligatoria', field: 'taskDescription_0' };
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

function createTaskElement(task) {
  const item = document.createElement('div');
  item.className = 'task-item';
  // Usar _id de MongoDB en lugar de id
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
function openEditForTask(taskId) {
  const task = tasks.find(t => (t._id || t.id) === taskId);
  if (!task) return alert('No se encontró la tarea para editar');

  document.getElementById('taskTitle_0').value = task.title;
  document.getElementById('taskDescription_0').value = task.description;
  document.getElementById('taskPriority_0').value = task.priority;
  document.getElementById('taskStatus_0').value = task.status;
  document.getElementById('taskStart_0').value = task.start ? task.start.split('T')[0] : '';
  document.getElementById('taskEnd_0').value = task.end ? task.end.split('T')[0] : '';

  taskForm.setAttribute('data-editing-id', taskId);
  openModal();
}

// --------- STATUS MENU ----------
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

// --------- UTILIDADES ----------
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