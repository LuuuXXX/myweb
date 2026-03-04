const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const requireLogin = require('../middleware/auth');
const { getDocumentsByUser, getDocumentById, createDocument, updateDocument, deleteDocument } = require('../database');

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.use(requireLogin);

router.get('/', (req, res) => {
  const docs = getDocumentsByUser(req.session.userId);
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('documents/list', { docs, flash, username: req.session.username });
});

router.get('/new', (req, res) => {
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('documents/new', { flash, username: req.session.username });
});

router.post('/', (req, res) => {
  const { title, content } = req.body;
  if (!title || !title.trim()) {
    req.session.flash = { type: 'error', message: '标题不能为空' };
    return res.redirect('/documents/new');
  }
  createDocument(req.session.userId, title.trim(), content || '');
  req.session.flash = { type: 'success', message: '文档创建成功' };
  res.redirect('/documents');
});

router.get('/:id/edit', (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc || doc.user_id !== req.session.userId) {
    req.session.flash = { type: 'error', message: '文档不存在或无权访问' };
    return res.redirect('/documents');
  }
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('documents/edit', { doc, flash, username: req.session.username });
});

router.post('/:id/update', (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc || doc.user_id !== req.session.userId) {
    req.session.flash = { type: 'error', message: '文档不存在或无权访问' };
    return res.redirect('/documents');
  }
  const { title, content } = req.body;
  if (!title || !title.trim()) {
    req.session.flash = { type: 'error', message: '标题不能为空' };
    return res.redirect(`/documents/${req.params.id}/edit`);
  }
  updateDocument(req.params.id, title.trim(), content || '');
  req.session.flash = { type: 'success', message: '文档更新成功' };
  res.redirect(`/documents/${req.params.id}`);
});

router.get('/:id', (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc || doc.user_id !== req.session.userId) {
    req.session.flash = { type: 'error', message: '文档不存在或无权访问' };
    return res.redirect('/documents');
  }
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('documents/view', { doc, flash, username: req.session.username });
});

router.post('/:id/delete', (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc || doc.user_id !== req.session.userId) {
    req.session.flash = { type: 'error', message: '文档不存在或无权访问' };
    return res.redirect('/documents');
  }
  deleteDocument(req.params.id);
  req.session.flash = { type: 'success', message: '文档已删除' };
  res.redirect('/documents');
});

router.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未选择图片文件或文件类型不支持' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.post('/upload/video', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未选择视频文件或文件类型不支持' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
