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
    .then((users) => res.status(200).send({ data: users }))
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError({
          message: 'Запрашиваемый пользователь не найден',
        });
      }
      res.send({ user });
    })
    .catch(next);
};

const getUserProfile = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.send(user);
    })
    .catch(next);
};

const createUsers = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password || !email) {
    throw new ValidationError('Почта или пароль должны быть заполнены');
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new UserAlreadyExists('Такой пользователь уже существует');
      } else {
        bcrypt.hash(password, saltRounds)
          .then((hash) => User.create({
            name,
            about,
            avatar,
            email,
            password: hash,
          }))
          .then((userData) => res.send({
            name: userData.name,
            about: userData.about,
            avatar: userData.avatar,
            id: userData._id,
            email: userData.email,
          }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              next(new ValidationError('Некорректные данные при создании пользователя'));
            }
            if (err.code === 11000) {
              next(new UserAlreadyExists('Такой пользователь уже существует'));
            }
            next(err);
          });
      }
    })
    .catch(next);
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
      res.send(user);
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
      res.send(user);
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
  const { email, password } = req.body;

  return User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неправильный логин или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthError('Неправильный логин или пароль');
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : '10d5865c85b895c6386a5501acfee2775244c5b6f4d2c16036b1c5858d392b34',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
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
