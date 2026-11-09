// Mini social media app - backend (Express + SQLite)
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'social.db'));

// ---------- database tables ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    bio TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, post_id)
  );
  CREATE TABLE IF NOT EXISTS followers (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    PRIMARY KEY (follower_id, following_id)
  );
`);

// ---------- middleware ----------
app.use(express.json());
app.use(session({ secret: 'change-this-secret', resave: false, saveUninitialized: false }));
app.use(express.static(__dirname));

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please log in first' });
  next();
}

// base query used for the feed and for profile pages
const POST_SELECT = `
  SELECT p.id, p.content, p.created_at, u.username,
    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments,
    EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked
  FROM posts p JOIN users u ON u.id = p.user_id`;

// ---------- auth ----------
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 4)
    return res.status(400).json({ error: 'Username and a password (min 4 chars) are required' });
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username))
    return res.status(400).json({ error: 'That username is already taken' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username.trim(), hash);
  req.session.userId = info.lastInsertRowid;
  res.json({ username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(400).json({ error: 'Wrong username or password' });
  req.session.userId = user.id;
  res.json({ username: user.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json(null);
  const user = db.prepare('SELECT username, bio FROM users WHERE id = ?').get(req.session.userId);
  res.json(user || null);
});

// ---------- posts ----------
app.get('/api/posts', requireLogin, (req, res) => {
  res.json(db.prepare(POST_SELECT + ' ORDER BY p.id DESC').all(req.session.userId));
});

app.post('/api/posts', requireLogin, (req, res) => {
  const content = (req.body.content || '').trim();
  if (!content) return res.status(400).json({ error: 'Post cannot be empty' });
  db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)').run(req.session.userId, content);
  res.json({ ok: true });
});

// like / unlike in one route
app.post('/api/posts/:id/like', requireLogin, (req, res) => {
  const args = [req.session.userId, req.params.id];
  const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(...args);
  if (existing) db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(...args);
  else db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(...args);
  res.json({ ok: true });
});

// ---------- comments ----------
app.get('/api/posts/:id/comments', requireLogin, (req, res) => {
  const rows = db.prepare(`
    SELECT c.content, c.created_at, u.username FROM comments c
    JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.id`).all(req.params.id);
  res.json(rows);
});

app.post('/api/posts/:id/comments', requireLogin, (req, res) => {
  const content = (req.body.content || '').trim();
  if (!content) return res.status(400).json({ error: 'Comment cannot be empty' });
  db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)')
    .run(req.params.id, req.session.userId, content);
  res.json({ ok: true });
});

// ---------- profiles & follow ----------
app.get('/api/users/:username', requireLogin, (req, res) => {
  const user = db.prepare('SELECT id, username, bio FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const count = (col, other) =>
    db.prepare(`SELECT COUNT(*) AS n FROM followers WHERE ${col} = ?`).get(user.id).n;

  res.json({
    username: user.username,
    bio: user.bio,
    followers: count('following_id'),
    following: count('follower_id'),
    isFollowing: !!db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?')
      .get(req.session.userId, user.id),
    isMe: user.id === req.session.userId,
    posts: db.prepare(POST_SELECT + ' WHERE u.id = ? ORDER BY p.id DESC').all(req.session.userId, user.id)
  });
});

app.post('/api/users/:username/follow', requireLogin, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target || target.id === req.session.userId)
    return res.status(400).json({ error: 'Cannot follow this user' });

  const args = [req.session.userId, target.id];
  const existing = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(...args);
  if (existing) db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?').run(...args);
  else db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(...args);
  res.json({ ok: true });
});

app.put('/api/me', requireLogin, (req, res) => {
  db.prepare('UPDATE users SET bio = ? WHERE id = ?').run((req.body.bio || '').slice(0, 160), req.session.userId);
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
