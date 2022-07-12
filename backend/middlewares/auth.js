const jwt = require('jsonwebtoken');
const AuthError = require('../utils/errors/authorized-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const Authorized = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : '1da668578bd1c39ad42b0f225498c43081767e10d26f639a0f9247428e4cde12');
  } catch (err) {
    next(new AuthError('jwt token не валиден'));
  }
  req.user = payload;
  next();
};

module.exports = Authorized;
