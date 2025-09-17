// dashBoard.js (reemplaza tu archivo existente con este)
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
let taskForm; // IMPORTANT: debe coincidir con id="taskForm" en el HTML
let taskGroups;
let todoContainer, inProgressContainer, doneContainer;
let tasks = []; // array de objetos {id, title, description, priority, status, start, end}

// --------- AUTH & WELCOME (si usas token) ----------
function checkAuthentication() {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");
  const localToken = localStorage.getItem('authToken');

  if (urlToken) {
    localStorage.setItem('authToken', urlToken);
    return true;
  }
  if (localToken) return true;

  // Si quieres forzar login, descomenta lo siguiente:
  // window.location.href = 'login.html';
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

  // DOM elements (asegúrate que estos ids existen en tu HTML)
  modal = document.getElementById('taskModal');
  createTaskBtn = document.getElementById('createTaskBtn');
  closeModalBtn = document.querySelector('.close-modal');
  cancelModalBtn = document.getElementById('cancelModalBtn');
  saveTaskBtn = document.getElementById('saveTaskBtn');
  taskForm = document.getElementById('taskForm'); // <-- revisa que exista
  taskGroups = document.getElementById('task-groups');
  todoContainer = document.getElementById('todo-tasks');
  inProgressContainer = document.getElementById('inProgress-tasks');
  doneContainer = document.getElementById('done-tasks');

  // sanity checks
  if (!taskForm) console.error('No se encontró #taskForm en el HTML');
  if (!todoContainer || !inProgressContainer || !doneContainer) console.error('Faltan contenedores de columnas (todo/inProgress/done)');

  attachEventListeners();
  loadTasksFromStorage();
  renderAllTasks();
  checkEmptyContainers();
  showWelcomeMessage();
});

function attachEventListeners() {
  if (createTaskBtn) createTaskBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  if (saveTaskBtn) saveTaskBtn.addEventListener('click', (e) => { e.preventDefault(); saveAllTasks(); });

  // close modal if click fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // menu toggle (si está)
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.getElementById('sideMenu')?.classList.toggle('open');
    });
  }

  // user dropdown
  const userIcon = document.querySelector('.user-icon');
  if (userIcon) userIcon.addEventListener('click', () => {
    document.querySelector('.user-menu')?.classList.toggle('open');
  });

  // event delegation para botones dentro de columnas
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
      // mostrar menu de cambio de estado
      showStatusMenu(taskId, btn);
    }
  });
}

// --------- STORAGE ----------
function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) tasks = JSON.parse(raw);
    else tasks = [];
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
  // focus primer campo si existe
  document.getElementById('taskTitle_0')?.focus();
}

function closeModal() {
  if (!modal) return;
  modal.style.display = 'none';
  // quitar editing flag
  taskForm?.removeAttribute('data-editing-id');
}

function resetTaskForm() {
  if (!taskForm) return;
  taskForm.reset();
  taskForm.removeAttribute('data-editing-id');
  // Asegurar que selects tengan un valor por defecto
  const pr = document.getElementById('taskPriority_0');
  if (pr && !pr.value) pr.value = 'low';
  const st = document.getElementById('taskStatus_0');
  if (st && !st.value) st.value = 'todo';
}

// Validación simple: todos los campos obligatorios
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

  // opcional: comprobar que start <= end
  if (new Date(start) > new Date(end)) return { ok: false, message: 'La fecha de inicio no puede ser posterior a la fecha de cierre', field: 'taskStart_0' };

  return { ok: true, data: { title, description, priority, status, start, end } };
}

function saveAllTasks() {
  const v = validateForm();
  if (!v.ok) {
    alert(v.message);
    // focus en campo problemático si se dio
    if (v.field) document.getElementById(v.field)?.focus();
    return;
  }
  const { title, description, priority, status, start, end } = v.data;

  const editingId = taskForm.getAttribute('data-editing-id');
  if (editingId) {
    // actualizar
    const idx = tasks.findIndex(t => t.id === editingId);
    if (idx > -1) {
      tasks[idx] = { ...tasks[idx], title, description, priority, status, start, end };
    }
  } else {
    // crear nueva tarea
    const newTask = {
      id: 'task-' + Date.now(),
      title, description, priority, status, start, end
    };
    tasks.push(newTask);
  }

  saveTasksToStorage();
  renderAllTasks();
  closeModal();
  checkEmptyContainers();
}

// --------- RENDER ----------
function renderAllTasks() {
  // vaciar columnas
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
  item.id = task.id;

  // Guardamos datos en dataset para editar fácilmente
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

  // si ya está done, no mostrar completar
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
  // remover si ya estaba en alguna columna
  document.querySelectorAll('.task-item').forEach(n => {
    if (n.id === taskElement.id) {
      n.remove();
    }
  });

  if (status === 'todo' && todoContainer) todoContainer.appendChild(taskElement);
  else if (status === 'inProgress' && inProgressContainer) inProgressContainer.appendChild(taskElement);
  else if (status === 'done' && doneContainer) doneContainer.appendChild(taskElement);
  else if (todoContainer) todoContainer.appendChild(taskElement); // fallback
}

// --------- EDIT / DELETE / STATUS ----------
function openEditForTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return alert('No se encontró la tarea para editar');

  // Llenar form con valores
  document.getElementById('taskTitle_0').value = task.title;
  document.getElementById('taskDescription_0').value = task.description;
  document.getElementById('taskPriority_0').value = task.priority;
  document.getElementById('taskStatus_0').value = task.status;
  document.getElementById('taskStart_0').value = task.start;
  document.getElementById('taskEnd_0').value = task.end;

  taskForm.setAttribute('data-editing-id', taskId);
  openModal();
}

function deleteTask(taskId) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasksToStorage();
  // remover del DOM si existe
  document.getElementById(taskId)?.remove();
  checkEmptyContainers();
}

function updateTaskStatusById(taskId, newStatus, dontOpenMenu = false) {
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  tasks[idx].status = newStatus;
  saveTasksToStorage();
  renderAllTasks();
  if (!dontOpenMenu) checkEmptyContainers();
}

// Menu de cambio de estado simple
function showStatusMenu(taskId, buttonEl) {
  // eliminar cualquier menu existente
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

  // position menu near el botón
  const rect = buttonEl.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(menu);

  // cerrar al click fuera
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
