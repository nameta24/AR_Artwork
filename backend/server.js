const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// ✅ Make sure uploads folder exists BEFORE creating DB
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Now safe to open the DB
const db = new sqlite3.Database(path.join(uploadDir, 'database.db'));
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS artworks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, artwork_url TEXT, ar_content_url TEXT, ar_url TEXT, FOREIGN KEY (user_id) REFERENCES users(id))");
  db.run("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)", ['test', 'test']);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|mp4/;
    const extname = path.extname(file.originalname).toLowerCase();
    if (filetypes.test(extname)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${extname}. Use JPG/PNG or MP4 only!`));
  }
});

const frontendPath = path.join(__dirname, '../frontend');
app.use('/static', express.static(frontendPath));
app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.sendFile(path.join(frontendPath, 'login.html'));
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT id FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) return res.status(500).send('Server error');
    if (row) {
      req.session.userId = row.id;
      res.redirect('/dashboard');
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.post('/upload/:type', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });
});

app.post('/publish', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { artworkUrl, arContentUrl } = req.body;
  if (!artworkUrl || !arContentUrl) return res.status(400).json({ error: 'Missing URLs' });
  const arUrl = `/ar?artwork=${encodeURIComponent(artworkUrl)}&arContent=${encodeURIComponent(arContentUrl)}`;
  db.run("INSERT INTO artworks (user_id, artwork_url, ar_content_url, ar_url) VALUES (?, ?, ?, ?)",
    [req.session.userId, artworkUrl, arContentUrl, arUrl], (err) => {
      if (err) {
        console.error('Publish error:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ url: arUrl });
    });
});

app.get('/ar', (req, res) => {
  res.sendFile(path.join(frontendPath, 'ar.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend running on port ${port}`));
