const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getUserByEmail, getUserByUsername, createUser } = require('../database');

router.get('/register', (req, res) => {
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('auth/register', { flash });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    req.session.flash = { type: 'error', message: '请填写所有字段' };
    return res.redirect('/auth/register');
  }
  if (password.length < 6) {
    req.session.flash = { type: 'error', message: '密码至少需要6位字符' };
    return res.redirect('/auth/register');
  }
  try {
    if (getUserByEmail(email)) {
      req.session.flash = { type: 'error', message: '该邮箱已被注册' };
      return res.redirect('/auth/register');
    }
    if (getUserByUsername(username)) {
      req.session.flash = { type: 'error', message: '该用户名已被使用' };
      return res.redirect('/auth/register');
    }
    const hash = await bcrypt.hash(password, 10);
    createUser(username, email, hash);
    req.session.flash = { type: 'success', message: '注册成功，请登录' };
    res.redirect('/auth/login');
  } catch (err) {
    req.session.flash = { type: 'error', message: '注册失败，请重试' };
    res.redirect('/auth/register');
  }
});

router.get('/login', (req, res) => {
  const flash = req.session.flash;
  delete req.session.flash;
  res.render('auth/login', { flash });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.session.flash = { type: 'error', message: '请填写邮箱和密码' };
    return res.redirect('/auth/login');
  }
  try {
    const user = getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      req.session.flash = { type: 'error', message: '邮箱或密码错误' };
      return res.redirect('/auth/login');
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/documents');
  } catch (err) {
    req.session.flash = { type: 'error', message: '登录失败，请重试' };
    res.redirect('/auth/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
});

module.exports = router;
