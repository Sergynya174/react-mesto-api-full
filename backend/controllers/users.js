const bcrypt = require('bcrypt');
const { genToken } = require('../middlewares/auth');
const User = require('../models/user');
const NotFoundError = require('../utils/errors/not-found-err');
const ValidationError = require('../utils/errors/validation-err');
const AuthError = require('../utils/errors/authorized-err');
const UserAlreadyExists = require('../utils/errors/user-already-exists');

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
  User.findById(req.user.id)
    .then((user) => res.send(user))
    .catch((err) => {
      next(err);
    });
};

const createUsers = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password || !email) {
    throw new ValidationError('Поля email и пароль должны быть заполнены');
  }
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
            avatar: user.avatar,
            email: user.email,
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
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неправильные Email или пароль');
      }

      const passwordValid = bcrypt.compare(password, user.password);

      return Promise.all([passwordValid, user]);
    })
    .then(([passwordValid, user]) => {
      if (!passwordValid) {
        throw new AuthError('Неправильные Email или пароль');
      }
      return genToken({ id: user._id });
    })
    .then((token) => res.send({ token }))
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getUsers,
  getUser,
  createUsers,
  getUserProfile,
  patchUserProfile,
  patchUserAvatar,
  login,
};
