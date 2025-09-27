import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT']
}));
app.use(express.json());

app.post('/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email y password son requeridos' });

    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rowCount > 0) return res.status(409).json({ error: 'Email ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING id,name,email',
      [name, email, hash]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error registrando usuario' });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'email y password requeridos' });

    const { rows } = await pool.query('SELECT id,name,email,password FROM users WHERE email=$1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const { id, name, email: em } = rows[0];
    res.json({ id, name, email: em });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en login' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { user_id, title, description } = req.body ?? {};
    if (!user_id || !title) return res.status(400).json({ error: 'user_id y title requeridos' });

    const { rows } = await pool.query(
      'INSERT INTO tasks(user_id,title,description) VALUES($1,$2,$3) RETURNING *',
      [user_id, title, description ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando tarea' });
  }
});

app.get('/tasks/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'userId inválido' });

    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error listando tareas' });
  }
});

app.put('/tasks/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const { rows } = await pool.query('SELECT status FROM tasks WHERE id=$1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });

    const current = rows[0].status;
    const next = current === 'pending' ? 'in_progress' : current === 'in_progress' ? 'done' : 'done';

    const updated = await pool.query('UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *', [next, id]);
    res.json(updated.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en :${PORT}`));
