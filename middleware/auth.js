module.exports = function requireLogin(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = { type: 'error', message: '请先登录后再访问该页面' };
    return res.redirect('/auth/login');
  }
  next();
};
