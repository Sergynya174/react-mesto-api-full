const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../utils/errors/not-found-err');
const ValidationError = require('../utils/errors/validation-err');
const AuthError = require('../utils/errors/authorized-err');
const UserAlreadyExists = require('../utils/errors/user-already-exists');

const { NODE_ENV, JWT_SECRET } = process.env;

const saltRounds = 10;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      next(err);
    });
};

const getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError({
          message: 'Запрашиваемый пользователь не найден',
        });
      }
      res.send({ data: user });
    })
    .catch((err) => {
      next(err);
    });
};

const getUserProfile = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch((err) => {
      next(err);
    });
};

const createUsers = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt
    .hash(password, saltRounds)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((user) => {
          const resUser = {
            name: user.name,
            about: user.about,
            email: user.email,
            avatar: user.avatar,
            _id: user._id,
          };
          res.send({ data: resUser });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(
              new ValidationError('Некорректные данные при создании пользователя'),
            );
          }
          if (err.code === 11000) {
            return next(
              new UserAlreadyExists('Такой пользователь уже существует'),
            );
          }
          return next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

const patchUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(
          new ValidationError(`Переданы некорректные данные ${err.message}`),
        );
      } else {
        next(err);
      }
    });
};

const patchUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(
          new ValidationError(`Переданы некорректные данные ${err.message}`),
        );
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email } = req.body;

  return User.findOne({ email })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      } else {
        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'some',
          { expiresIn: '7d' },
        );
        res.cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
          .send({ message: 'Авторизация прошла успешно!' });
      }
    })
    .catch(() => {
      throw new AuthError('Неправильный логин или пароль');
    })
    .catch((err) => {
      next(err);
    });
};

const logout = (req, res) => {
  res.clearCookie('jwt').send();
};

module.exports = {
  getUsers,
  getUser,
  createUsers,
  getUserProfile,
  patchUserProfile,
  patchUserAvatar,
  login,
  logout,
};
