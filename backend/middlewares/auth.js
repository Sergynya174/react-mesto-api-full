const jwt = require('jsonwebtoken');
const AuthError = require('../utils/errors/authorized-err');

const secretCode = '111';
const genToken = (payload) => jwt.sign(payload, secretCode, { expiresIn: '7d' });

const Authorized = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    throw new AuthError('Необходима авторизация');
  }
  const token = auth.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, secretCode);
  } catch (err) {
    return next(new AuthError('jwt token не валиден'));
  }
  req.user = payload;
  return next();
};

module.exports = {
  Authorized,
  genToken,
};
