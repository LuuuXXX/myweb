const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');

const app = express();
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: dataDir }),
  secret: 'myweb-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

app.use((req, res, next) => {
  res.locals.username = req.session.username || null;
  res.locals.userId = req.session.userId || null;
  next();
});

app.use('/auth', require('./routes/auth'));
app.use('/documents', require('./routes/documents'));

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/documents');
  res.render('index', { username: null });
});

app.use((req, res) => {
  res.status(404).render('404', { username: req.session.username || null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`服务器运行在 http://localhost:${PORT}`));
