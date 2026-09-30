const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET is required in production');
    process.exit(1);
  }
  console.warn('JWT_SECRET not set — using dev fallback');
  process.env.JWT_SECRET = 'dev-secret-change-me';
}

const User = require('./User.js');

const {
  getBooks,
  addBook,
  updateBook,
  deleteBook
} = require('./bookStorage.js');

app.use(express.json());
app.use(cookieParser());

// Serve the BookTracker page
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

app.get('/styles.css', (req, res) => {
  res.sendFile('styles.css', { root: '.' });
});

app.get('/app.js', (req, res) => {
  res.sendFile('app.js', { root: '.' });
});

app.get('/render.js', (req, res) => {
  res.sendFile('render.js', { root: '.' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash
    });

    // Automatically log the new user in
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });

    res.json({
      id: user._id.toString(),
      email: user.email
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: 'Could not create account'
    });
  }
});


// Log in
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      error: 'Invalid email or password'
    });
  }

  const valid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!valid) {
    return res.status(401).json({
      error: 'Invalid email or password'
    });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });

  res.json({
    id: user._id.toString(),
    email: user.email
  });
});

// Authentication middleware
function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
}

// Log out
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// GET books for logged-in user
app.get('/api/books', requireAuth, async (req, res) => {
  res.json(await getBooks(req.userId));
});

// POST a book for logged-in user
app.post('/api/books', requireAuth, async (req, res) => {
  if (
    !req.body.title ||
    typeof req.body.title !== 'string' ||
    !req.body.title.trim()
  ) {
    return res.status(400).json({
      error: 'Title is required'
    });
  }

  if (
    !req.body.author ||
    typeof req.body.author !== 'string' ||
    !req.body.author.trim()
  ) {
    return res.status(400).json({
      error: 'Author is required'
    });
  }

  const newBook = await addBook(req.userId, {
    title: req.body.title,
    author: req.body.author,
    reason: req.body.reason,
    status: 'want'
  });

  res.json(newBook);
});

// Update a book belonging to logged-in user
app.put('/api/books/:id', requireAuth, async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Invalid book id'
    });
  }

  const changes = {};

  if (req.body.status !== undefined) {
    changes.status = req.body.status;
  }

  if (req.body.finishedAt !== undefined) {
    changes.finishedAt = req.body.finishedAt;
  }

  const updated = await updateBook(
    req.userId,
    id,
    changes
  );

  if (!updated) {
    return res.status(404).json({
      error: 'Book not found'
    });
  }

  res.json(updated);
});

// Delete a book belonging to logged-in user
app.delete('/api/books/:id', requireAuth, async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Invalid book id'
    });
  }

  const deleted = await deleteBook(
    req.userId,
    id
  );

  if (!deleted) {
    return res.status(404).json({
      error: 'Book not found'
    });
  }

  res.json(await getBooks(req.userId));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(process.env.PORT, () => {
      console.log('BookTracker server is listening');
    });
  })
  .catch((error) => {
    console.error(
      'MongoDB connection failed:',
      error
    );

    process.exit(1);
  });
