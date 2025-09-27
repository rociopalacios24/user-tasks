const API = (location.hostname === 'localhost')
  ? 'http://localhost:3000'
  : 'https://TU-BACKEND-ON-RENDER.onrender.com';

const qs = (s) => document.querySelector(s);

const state = {
  user: JSON.parse(localStorage.getItem('user') || 'null')
};

function show(section) {
  qs('#auth').classList.toggle('hidden', section !== 'auth');
  qs('#app').classList.toggle('hidden', section !== 'app');
}

function setUser(u) {
  state.user = u;
  if (u) {
    localStorage.setItem('user', JSON.stringify(u));
    qs('#hello').textContent = `Hola, ${u.name} (${u.email})`;
    show('app');
    loadTasks();
  } else {
    localStorage.removeItem('user');
    show('auth');
  }
}

async function register() {
  qs('#reg-msg').textContent = '';
  const body = {
    name: qs('#reg-name').value.trim(),
    email: qs('#reg-email').value.trim(),
    password: qs('#reg-pass').value
  };
  const res = await fetch(`${API}/users/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) { qs('#reg-msg').textContent = data.error || 'Error'; return; }
  qs('#reg-msg').textContent = 'Usuario creado. Ahora inicia sesión.';
}

async function login() {
  qs('#log-msg').textContent = '';
  const body = {
    email: qs('#log-email').value.trim(),
    password: qs('#log-pass').value
  };
  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) { qs('#log-msg').textContent = data.error || 'Error'; return; }
  setUser(data);
}

async function addTask() {
  qs('#add-msg').textContent = '';
  const title = qs('#task-title').value.trim();
  const description = qs('#task-desc').value.trim();
  if (!title) { qs('#add-msg').textContent = 'Título requerido'; return; }
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ user_id: state.user.id, title, description })
  });
  const data = await res.json();
  if (!res.ok) { qs('#add-msg').textContent = data.error || 'Error'; return; }
  qs('#task-title').value = '';
  qs('#task-desc').value = '';
  loadTasks();
}

function badge(status) {
  return `<span class="status">${status}</span>`;
}

async function loadTasks() {
  const res = await fetch(`${API}/tasks/${state.user.id}`);
  const tasks = await res.json();
  const ul = qs('#task-list');
  ul.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task';
    li.innerHTML = `
      <div>
        ${badge(t.status)} <strong>${t.title}</strong><br/>
        <small>${t.description ?? ''}</small>
      </div>
      <div>
        <button data-id="${t.id}" class="advance">Avanzar estado</button>
      </div>
    `;
    ul.appendChild(li);
  });
  ul.querySelectorAll('.advance').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const res = await fetch(`${API}/tasks/${id}/status`, { method: 'PUT' });
      if (res.ok) loadTasks();
    });
  });
}

qs('#btn-register').addEventListener('click', register);
qs('#btn-login').addEventListener('click', login);
qs('#btn-add').addEventListener('click', addTask);
qs('#btn-logout').addEventListener('click', () => setUser(null));

setUser(state.user);
