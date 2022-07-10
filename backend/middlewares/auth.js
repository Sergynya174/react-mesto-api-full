const jwt = require('jsonwebtoken');
const AuthError = require('../utils/errors/authorized-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const Authorized = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    throw new AuthError('Необходима авторизация');
  }
  const token = auth.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key');
  } catch (err) {
    return next(new AuthError('jwt token не валиден'));
  }
  req.user = payload;
  return next();
};

module.exports = Authorized;
