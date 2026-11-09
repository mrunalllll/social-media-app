// Frontend logic for Buzzly (plain JavaScript, no frameworks)

const app = document.getElementById('app');
const topbar = document.getElementById('topbar');
let me = null;           // the logged in user
let authMode = 'login';  // login or register form

// ---------- small helpers ----------
async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// stops users from injecting HTML into the page
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// pick a colour for the avatar based on the username
function avatar(name, big) {
  const colors = ['#6c5ce7', '#e84393', '#00b894', '#fdcb6e', '#0984e3', '#e17055'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return `<div class="avatar ${big ? 'big' : ''}" style="background:${color}">${esc(name[0].toUpperCase())}</div>`;
}

function formatDate(str) {
  return new Date(str + 'Z').toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

// ---------- auth screen ----------
function showAuth() {
  topbar.hidden = true;
  const isLogin = authMode === 'login';
  app.innerHTML = `
    <div class="card auth-box">
      <h1>social media</h1>
      <p class="sub">${isLogin ? 'Welcome back!' : 'Create your account'}</p>
      <input id="username" placeholder="Username">
      <input id="password" type="password" placeholder="Password">
      <button class="btn" id="authBtn">${isLogin ? 'Login' : 'Sign up'}</button>
      <p class="switch">
        ${isLogin ? "Don't have an account?" : 'Already registered?'}
        <a id="switchAuth">${isLogin ? 'Sign up' : 'Login'}</a>
      </p>
    </div>`;

  document.getElementById('switchAuth').onclick = () => {
    authMode = isLogin ? 'register' : 'login';
    showAuth();
  };

  document.getElementById('authBtn').onclick = async () => {
    try {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      await api('/api/' + authMode, 'POST', { username, password });
      await init();
    } catch (err) {
      toast(err.message);
    }
  };
}

// ---------- post card ----------
function postHTML(p) {
  return `
    <div class="card" data-id="${p.id}">
      <div class="post-head">
        ${avatar(p.username)}
        <div>
          <a class="name" href="#/user/${encodeURIComponent(p.username)}">${esc(p.username)}</a>
          <div class="time">${formatDate(p.created_at)}</div>
        </div>
      </div>
      <div class="post-body">${esc(p.content)}</div>
      <div class="post-actions">
        <button class="action like-btn ${p.liked ? 'liked' : ''}">${p.liked ? '♥' : '♡'} ${p.likes}</button>
        <button class="action comment-btn">💬 ${p.comments}</button>
      </div>
      <div class="comments" hidden></div>
    </div>`;
}

// ---------- feed ----------
async function showFeed() {
  const posts = await api('/api/posts');
  app.innerHTML = `
    <div class="card">
      <textarea id="newPost" placeholder="What's on your mind, ${esc(me.username)}?" maxlength="280"></textarea>
      <button class="btn" id="postBtn">Post</button>
    </div>
    <div id="posts">
      ${posts.length ? posts.map(postHTML).join('') : '<p class="empty">No posts yet. Be the first!</p>'}
    </div>`;

  document.getElementById('postBtn').onclick = async () => {
    try {
      await api('/api/posts', 'POST', { content: document.getElementById('newPost').value });
      showFeed();
    } catch (err) {
      toast(err.message);
    }
  };
}

// ---------- profile ----------
async function showProfile(username) {
  const u = await api('/api/users/' + encodeURIComponent(username));
  app.innerHTML = `
    <div class="card profile-head">
      ${avatar(u.username, true)}
      <h2>${esc(u.username)}</h2>
      <p class="bio">${esc(u.bio || 'No bio yet')}</p>
      <div class="stats">
        <div><b>${u.posts.length}</b><span>Posts</span></div>
        <div><b>${u.followers}</b><span>Followers</span></div>
        <div><b>${u.following}</b><span>Following</span></div>
      </div>
      ${u.isMe
        ? '<button class="btn small ghost" id="editBio">Edit bio</button>'
        : `<button class="btn small" id="followBtn">${u.isFollowing ? 'Unfollow' : 'Follow'}</button>`}
    </div>
    ${u.posts.length ? u.posts.map(postHTML).join('') : '<p class="empty">No posts yet.</p>'}`;

  if (u.isMe) {
    document.getElementById('editBio').onclick = async () => {
      const bio = prompt('Write your new bio (max 160 characters):', u.bio);
      if (bio === null) return;
      await api('/api/me', 'PUT', { bio });
      showProfile(username);
    };
  } else {
    document.getElementById('followBtn').onclick = async () => {
      await api(`/api/users/${encodeURIComponent(username)}/follow`, 'POST');
      showProfile(username);
    };
  }
}

// ---------- comments ----------
async function toggleComments(card) {
  const box = card.querySelector('.comments');
  if (!box.hidden) { box.hidden = true; return; }

  const list = await api(`/api/posts/${card.dataset.id}/comments`);
  box.innerHTML = list.map(c =>
    `<div class="comment"><b>${esc(c.username)}</b> ${esc(c.content)}</div>`).join('') + `
    <div class="comment-form">
      <input placeholder="Write a comment...">
      <button class="btn small">Send</button>
    </div>`;
  box.hidden = false;

  box.querySelector('button').onclick = async () => {
    const input = box.querySelector('input');
    if (!input.value.trim()) return;
    await api(`/api/posts/${card.dataset.id}/comments`, 'POST', { content: input.value });
    box.hidden = true;
    await toggleComments(card);
    // update the comment count on the button
    card.querySelector('.comment-btn').textContent = '💬 ' + box.querySelectorAll('.comment').length;
  };
}

// one click listener for likes and comment buttons (works for posts added later too)
app.addEventListener('click', async (e) => {
  const card = e.target.closest('.card[data-id]');
  if (!card) return;

  if (e.target.closest('.like-btn')) {
    await api(`/api/posts/${card.dataset.id}/like`, 'POST');
    route();
  } else if (e.target.closest('.comment-btn')) {
    toggleComments(card);
  }
});

// ---------- routing ----------
async function route() {
  if (!me) return showAuth();
  const hash = location.hash || '#/';
  try {
    if (hash.startsWith('#/user/')) await showProfile(decodeURIComponent(hash.slice(7)));
    else await showFeed();
  } catch (err) {
    toast(err.message);
  }
}

window.addEventListener('hashchange', route);

document.getElementById('logoutBtn').onclick = async () => {
  await api('/api/logout', 'POST');
  me = null;
  location.hash = '#/';
  showAuth();
};

async function init() {
  me = await api('/api/me');
  if (!me) return showAuth();
  topbar.hidden = false;
  document.getElementById('myProfileLink').href = '#/user/' + encodeURIComponent(me.username);
  route();
}

init();
