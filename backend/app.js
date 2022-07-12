const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { validateURL, putError } = require('./utils/error-codes');
const { requestLogger, errorLogger } = require('./middlewares/logger');
require('dotenv').config();
const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');
const { login, logout, createUsers } = require('./controllers/users');
const NotFoundError = require('./utils/errors/not-found-err');
const Authorized = require('./middlewares/auth');
//const cors = require('./middlewares/cors');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

//app.use(cors);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов, пожалуйста, повторите попытку позже.',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use(requestLogger);
app.use(limiter);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      avatar: Joi.string().custom(validateURL),
    }),
  }),
  createUsers,
);
app.post('/logout', logout);

app.use('/', Authorized, userRouter);
app.use('/', Authorized, cardRouter);
app.use('*', Authorized, () => {
  throw new NotFoundError('Cтраница не найдена');
});

app.use(errorLogger);
app.use(errors());
app.use(putError);

app.listen(PORT, () => {
  console.log(`App started on ${PORT} port`);
});
