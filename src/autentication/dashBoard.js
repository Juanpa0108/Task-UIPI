// Variables globales
const taskStates = {
    todo: { name: 'Por hacer', class: 'status-todo' },
    inProgress: { name: 'En proceso', class: 'status-in-progress' },
    done: { name: 'Terminada', class: 'status-done' }
};

// Obtener parámetros de la URL
const params = new URLSearchParams(window.location.search);
const urlToken = params.get("token");

let editingTaskId = null;
let taskFormCount = 1;

// Elementos DOM
let modal, createTaskBtn, closeModalBtn, cancelModalBtn, saveTaskBtn, taskForms, taskGroups, completedTasks;

// ===== FUNCIONES DE AUTENTICACIÓN Y BIENVENIDA =====

// Función para verificar autenticación
function checkAuthentication() {
    // Primero verificar si hay token en localStorage
    const localToken = localStorage.getItem('authToken');
    
    // Si hay token en URL, guardarlo en localStorage
    if (urlToken) {
        localStorage.setItem('authToken', urlToken);
        return true;
    }
    
    // Si hay token en localStorage
    if (localToken) {
        return true;
    }
    
    // Si no hay token en ningún lado, redirigir al login
    window.location.href = 'login.html';
    return false;
}

// Función para mostrar el mensaje de bienvenida
function showWelcomeMessage() {
    console.log('=== INICIANDO MENSAJE DE BIENVENIDA ===');
    
    // Verificar todos los datos disponibles
    const authToken = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    const userData = localStorage.getItem('userData');
    
    
    // Obtener elementos del DOM
    const welcomeBanner = document.getElementById('welcomeBanner');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    
    if (!welcomeBanner || !welcomeMessage) {
        console.error('❌ Elementos del banner no encontrados');
        return;
    }
    
    // Determinar el nombre a mostrar
    let displayName = 'Usuario';
    
    if (userName && userName !== 'null' && userName !== 'undefined') {
        displayName = userName;
        console.log('✅ Usando userName del localStorage:', displayName);
    } else if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('Usuario parseado de userData:', user);
            if (user.firstName) {
                displayName = user.firstName;
                console.log('✅ Usando firstName de userData:', displayName);
                // Guardar para futuras referencias
                localStorage.setItem('userName', displayName);
            }
        } catch (error) {
            console.error('❌ Error parseando userData:', error);
        }
    }
    
    // Crear y mostrar el mensaje
    const message = `¡Bienvenido/a, ${displayName}! Has iniciado sesión correctamente.`;
    console.log('Mensaje final:', message);
    
    welcomeMessage.textContent = message;
    welcomeBanner.style.display = 'flex';
    
    console.log('✅ Banner mostrado exitosamente');
    
    // Ocultar el banner después de 5 segundos
    setTimeout(() => {
        closeWelcomeBanner();
    }, 5000);
}

// Función para cerrar el banner
function closeWelcomeBanner() {
    const welcomeBanner = document.getElementById('welcomeBanner');
    if (welcomeBanner) {
        welcomeBanner.style.display = 'none';
    }
}

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando dashboard...');
    
    // VERIFICAR AUTENTICACIÓN PRIMERO
    if (!checkAuthentication()) return;
    
    // Inicializar elementos DOM
    modal = document.getElementById('taskModal');
    createTaskBtn = document.getElementById('createTaskBtn');
    closeModalBtn = document.querySelector('.close-modal');
    cancelModalBtn = document.getElementById('cancelModalBtn');
    saveTaskBtn = document.getElementById('saveTaskBtn');
    taskForms = document.getElementById('taskForms');
    taskGroups = document.getElementById('task-groups');
    completedTasks = document.getElementById('completed-tasks');
    
    initializeEventListeners();
    checkEmptyContainers();
    
    // MOSTRAR MENSAJE DE BIENVENIDA
    showWelcomeMessage();
});

// ===== FUNCIONES EXISTENTES DEL DASHBOARD =====

// Event Listeners
function initializeEventListeners() {
    // Modal events
    createTaskBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    saveTaskBtn.addEventListener('click', saveAllTasks);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Menu toggle (for future implementation)
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        console.log('Menú toggle clicked - Para implementación futura');
    });
}
        // Toggle menú lateral
    document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.getElementById('sideMenu').classList.toggle('open');
    });

    // Toggle user dropdown
    document.querySelector('.user-icon').addEventListener('click', () => {
    document.querySelector('.user-menu').classList.toggle('open');
    });

// Modal Functions
function openModal() {
    modal.style.display = 'block';
    resetTaskForm();
}

function closeModal() {
    modal.style.display = 'none';
    editingTaskId = null;
}

function resetTaskForm() {
    taskForms.innerHTML = `
        <div class="task-form" data-form-id="0">
            <h3>Nueva Tarea</h3>
            <div class="form-group">
                <label for="taskTitle_0">Título</label>
                <input type="text" id="taskTitle_0" placeholder="Ingrese el título" required>
            </div>
            <div class="form-group">
                <label for="taskDescription_0">Descripción</label>
                <textarea id="taskDescription_0" placeholder="Ingrese la descripción"></textarea>
            </div>
            <div class="form-group">
                <label for="taskPriority_0">Prioridad</label>
                <select id="taskPriority_0">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                </select>
            </div>
            <div class="form-group">
                <label for="taskStatus_0">Estado</label>
                <select id="taskStatus_0">
                    <option value="todo">Por hacer</option>
                    <option value="inProgress">En proceso</option>
                    <option value="done">Terminada</option>
                </select>
            </div>
            <div class="form-group">
                <label for="taskStart_0">Fecha inicio</label>
                <input type="datetime-local" id="taskStart_0">
            </div>
            <div class="form-group">
                <label for="taskEnd_0">Fecha cierre</label>
                <input type="datetime-local" id="taskEnd_0">
            </div>
        </div>
    `;
    taskFormCount = 1;
}

// Task Management
function saveAllTasks() {
    const title = document.getElementById('taskTitle_0').value;
    const description = document.getElementById('taskDescription_0').value;
    const priority = document.getElementById('taskPriority_0').value;
    const status = document.getElementById('taskStatus_0').value;
    const start = document.getElementById('taskStart_0').value;
    const end = document.getElementById('taskEnd_0').value;

    if (!title.trim()) {
        alert('Por favor, ingrese un título para la tarea');
        return;
    }

    const taskId = editingTaskId || 'task-' + Date.now();
    createOrUpdateTask(taskId, title, description, priority, status, start, end);
    closeModal();
}

function createOrUpdateTask(taskId, title, description, priority, status, start, end) {
    const existingTask = document.getElementById(taskId);
    const isInCompleted = existingTask && completedTasks.contains(existingTask);

    const taskContent = `
        <div class="task-content">
            <div class="task-info">
                <div class="task-title">
                    ${title}
                    <span class="task-status ${taskStates[status].class}">${taskStates[status].name}</span>
                </div>
                <div class="task-description">${description}</div>
                <div class="task-dates">
                    ${start ? `<p><i class="fas fa-calendar-alt"></i> Inicio: ${new Date(start).toLocaleString()}</p>` : ""}
                    ${end ? `<p><i class="fas fa-calendar-check"></i> Cierre: ${new Date(end).toLocaleString()}</p>` : ""}
                </div>
            </div>
            <div class="task-actions">
                ${isInCompleted ? 
                    `<button class="btn-delete" onclick="deleteTask('${taskId}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>` :
                    `<button class="btn-edit" onclick="editTask('${taskId}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-status" onclick="showStatusMenu('${taskId}')">
                        <i class="fas fa-sync-alt"></i> Cambiar estado
                    </button>
                    <button class="btn-move" onclick="moveToCompleted('${taskId}')">
                        <i class="fas fa-check"></i> Completar
                    </button>
                    <button class="btn-delete" onclick="deleteTask('${taskId}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>`
                }
            </div>
        </div>
    `;


    // Create task column if it doesn't exist
    if (!taskGroups.querySelector('.task-column')) {
        const column = document.createElement('div');
        column.className = 'task-column';
        column.innerHTML = `
            <div class="column-header">
                <div class="column-title">
                    <h2>Tareas Pendientes</h2>
                    <span class="priority-star">★</span>
                </div>
            </div>
            <div class="task-items"></div>
        `;
        taskGroups.appendChild(column);
    }

    if (editingTaskId) {
        // Update existing task
        existingTask.innerHTML = taskContent;
        editingTaskId = null;
    } else {
        // Create new task
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.id = taskId;
        taskItem.innerHTML = taskContent;
        const taskItems = taskGroups.querySelector('.task-column .task-items');
        taskItems.appendChild(taskItem);
    }

    checkEmptyContainers();
}

function editTask(taskId) {
    const taskElement = document.getElementById(taskId);
    const titleElement = taskElement.querySelector('.task-title');
    const descriptionElement = taskElement.querySelector('.task-description');
    const statusElement = taskElement.querySelector('.task-status');
    const startDate = taskElement.querySelector('.task-dates small:nth-child(1)')?.textContent.replace("Inicio: ", "").trim();
    const endDate = taskElement.querySelector('.task-dates small:nth-child(3)')?.textContent.replace("Cierre: ", "").trim();

    let currentStatus = 'todo';
    for (const [key, value] of Object.entries(taskStates)) {
        if (value.class === statusElement.classList[1]) {
            currentStatus = key;
            break;
        }
    }

    resetTaskForm();
    document.getElementById('taskTitle_0').value = titleElement.childNodes[0].textContent.trim();
    document.getElementById('taskDescription_0').value = descriptionElement.textContent;
    document.getElementById('taskStatus_0').value = currentStatus;
    if (startDate && startDate !== "—") document.getElementById('taskStart_0').value = startDate;
    if (endDate && endDate !== "—") document.getElementById('taskEnd_0').value = endDate;


    

    editingTaskId = taskId;
    openModal();
}


function showStatusMenu(taskId) {
    const taskElement = document.getElementById(taskId);
    const currentStatusClass = taskElement.querySelector('.task-status').classList[1];
    
    // Find current status key
    let currentStatus = 'todo';
    for (const [key, value] of Object.entries(taskStates)) {
        if (value.class === currentStatusClass) {
            currentStatus = key;
            break;
        }
    }

    const menu = document.createElement('div');
    menu.className = 'status-menu';
    menu.innerHTML = Object.entries(taskStates).map(([key, value]) => `
        <div class="status-option ${key === currentStatus ? 'active' : ''}" 
             onclick="updateTaskStatus('${taskId}', '${key}')">
            ${value.name}
        </div>
    `).join('');
    
    // Position menu
    const button = taskElement.querySelector('.btn-status');
    const rect = button.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left}px`;
    
    // Remove existing menu if any
    const existingMenu = document.querySelector('.status-menu');
    if (existingMenu) existingMenu.remove();
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

function updateTaskStatus(taskId, status) {
    const taskElement = document.getElementById(taskId);
    if (!taskElement) return;

    const statusElement = taskElement.querySelector('.task-status');
    if (statusElement) {
        // Remove all status classes
        Object.values(taskStates).forEach(state => {
            statusElement.classList.remove(state.class);
        });
        
        // Add new status class
        statusElement.classList.add(taskStates[status].class);
        statusElement.textContent = taskStates[status].name;
    }
    
    document.querySelector('.status-menu')?.remove();
}

function moveToCompleted(taskId) {
    const taskElement = document.getElementById(taskId);
    
    taskElement.classList.add('fade-out');
    
    setTimeout(() => {
        completedTasks.appendChild(taskElement);
        taskElement.classList.remove('fade-out');
        
        // Update status to done
        updateTaskStatus(taskId, 'done');
        
        // Update actions
        const actionsDiv = taskElement.querySelector('.task-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = `
                <button class="btn-delete" onclick="deleteTask('${taskId}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>`;
        }
        
        checkEmptyContainers();
    }, 300);
}

function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        const taskElement = document.getElementById(taskId);
        if (taskElement) {
            taskElement.classList.add('fade-out');
            
            setTimeout(() => {
                taskElement.remove();
                checkEmptyContainers();
            }, 300);
        }
    }
}

function checkEmptyContainers() {
    const pendingContainer = document.querySelector('.task-column .task-items');
    const completedContainer = document.getElementById('completed-tasks');
    
    // Check pending tasks - solo mostrar mensaje si realmente no hay elementos de tarea
    if (pendingContainer) {
        const taskItems = pendingContainer.querySelectorAll('.task-item');
        if (taskItems.length === 0) {
            // Verificar si ya existe el mensaje para no duplicarlo
            if (!pendingContainer.querySelector('.no-tasks')) {
                pendingContainer.innerHTML = '<div class="no-tasks">No hay tareas pendientes</div>';
            }
        } else {
            // Si hay tareas, eliminar el mensaje de no tasks
            const noTasksMsg = pendingContainer.querySelector('.no-tasks');
            if (noTasksMsg) {
                noTasksMsg.remove();
            }
        }
    }
    

    // Check completed tasks
    if (completedContainer) {
        const taskItems = completedContainer.querySelectorAll('.task-item');
        if (taskItems.length === 0) {
            if (!completedContainer.querySelector('.no-tasks')) {
                completedContainer.innerHTML = '<div class="no-tasks">No hay tareas completadas</div>';
            }
        } else {
            const noTasksMsg = completedContainer.querySelector('.no-tasks');
            if (noTasksMsg) {
                noTasksMsg.remove();
            }
        }
    }
}
   
    

// Make functions available globally
window.editTask = editTask;
window.showStatusMenu = showStatusMenu;
window.updateTaskStatus = updateTaskStatus;
window.moveToCompleted = moveToCompleted;
window.deleteTask = deleteTask;
window.closeWelcomeBanner = closeWelcomeBanner;
window.closeWelcomeBanner = closeWelcomeBanner;