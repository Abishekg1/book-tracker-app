import { renderList, renderCounts } from './render.js';

let books = [];

async function loadBooks() {
const response = await fetch('/api/books', {
credentials: 'include'
});

if (response.status === 401) {
books = [];
return false;
}

if (!response.ok) {
throw new Error('Failed to load books');
}

books = await response.json();
return true;
}

async function main() {
const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title');
const authorInput = document.querySelector('#author');
const reasonInput = document.querySelector('#reason');
const listEl = document.querySelector('#book-list');
const countsEl = document.querySelector('#counts');
const filterButtons = document.querySelectorAll('.filter-btn');

const emailInput = document.querySelector('#auth-email');
const passwordInput = document.querySelector('#auth-password');
const signupBtn = document.querySelector('#signup-btn');
const loginBtn = document.querySelector('#login-btn');
const logoutBtn = document.querySelector('#logout-btn');
const authMessage = document.querySelector('#auth-message');

let currentFilter = 'all';

function render() {
renderList(books, currentFilter, listEl);
renderCounts(books, countsEl);
}

async function refreshBooks() {
const loggedIn = await loadBooks();

if (loggedIn) {
  render();
  return;
}

books = [];
render();
authMessage.textContent = 'Please log in to see your books.';


}

// SIGN UP
signupBtn.addEventListener('click', async function () {
const email = emailInput.value.trim();
const password = passwordInput.value;

if (!email || !password) {
  authMessage.textContent =
    'Email and password are required.';
  return;
}

const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    email,
    password
  })
});

const data = await response.json();

if (!response.ok) {
  authMessage.textContent =
    data.error || 'Sign up failed.';
  return;
}

authMessage.textContent =
  'Account created. Please log in.';

passwordInput.value = '';
await refreshBooks();


});

// LOGIN
loginBtn.addEventListener('click', async function () {
const email = emailInput.value.trim();
const password = passwordInput.value;

if (!email || !password) {
  authMessage.textContent =
    'Email and password are required.';
  return;
}

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    email,
    password
  })
});

const data = await response.json();

if (!response.ok) {
  authMessage.textContent =
    data.error || 'Login failed.';
  return;
}

authMessage.textContent =
  `Logged in as ${data.email}`;

passwordInput.value = '';

await refreshBooks();


});

// LOGOUT
logoutBtn.addEventListener('click', async function () {
await fetch('/api/auth/logout', {
method: 'POST',
credentials: 'include'
});

books = [];
render();

authMessage.textContent = 'Logged out.';


});

// ADD BOOK
async function handleAdd(event) {
event.preventDefault();

const title = titleInput.value.trim();
const author = authorInput.value.trim();
const reason = reasonInput.value.trim();

if (!title || !author) return;

const response = await fetch('/api/books', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    title,
    author,
    reason
  })
});

if (response.status === 401) {
  authMessage.textContent =
    'Please log in first.';
  return;
}

if (!response.ok) {
  const data = await response.json();

  authMessage.textContent =
    data.error || 'Could not add book.';
  return;
}

titleInput.value = '';
authorInput.value = '';
reasonInput.value = '';

await refreshBooks();


}

form.addEventListener('submit', handleAdd);

// FILTERS
function setFilter(filter) {
currentFilter = filter;

filterButtons.forEach(function (btn) {
  btn.classList.toggle(
    'active',
    btn.dataset.filter === filter
  );
});

render();


}

filterButtons.forEach(function (btn) {
btn.addEventListener('click', function () {
setFilter(btn.dataset.filter);
});
});

// BOOK ACTIONS
listEl.addEventListener('click', async function (event) {
const button = event.target.closest('button');

if (!button || !button.dataset.action) return;

const card = button.closest('[data-id]');

if (!card) return;

const book = books.find(function (b) {
  return String(b.id) === card.dataset.id;
});

if (!book) return;

const action = button.dataset.action;

// DELETE
if (action === 'delete') {
  const response = await fetch(
    `/api/books/${book.id}`,
    {
      method: 'DELETE',
      credentials: 'include'
    }
  );

  if (response.status === 401) {
    authMessage.textContent =
      'Please log in first.';
    return;
  }

  if (!response.ok) {
    return;
  }

  await refreshBooks();
  return;
}

// STATUS CHANGE
let status = book.status;
let finishedAt = book.finishedAt;

if (action === 'start') {
  status = 'reading';
} else if (action === 'finish') {
  status = 'finished';
  finishedAt = new Date()
    .toISOString()
    .slice(0, 10);
} else if (action === 'back') {
  status =
    book.status === 'finished'
      ? 'reading'
      : 'want';

  finishedAt = null;
}

const response = await fetch(
  `/api/books/${book.id}`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      status,
      finishedAt
    })
  }
);

if (response.status === 401) {
  authMessage.textContent =
    'Please log in first.';
  return;
}

if (!response.ok) {
  return;
}

await refreshBooks();


});

// FIRST LOAD
await refreshBooks();
}

main();