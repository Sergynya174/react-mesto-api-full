const jwt = require('jsonwebtoken');
const AuthError = require('../utils/errors/authorized-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const Authorized = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : '10d5865c85b895c6386a5501acfee2775244c5b6f4d2c16036b1c5858d392b34');
  } catch (err) {
    next(new AuthError('jwt token не валиден'));
  }
  req.user = payload;
  next();
};

module.exports = Authorized;
