const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { validateURL } = require('../utils/error-codes');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Жак-Ив Кусто',
      minlength: 2,
      maxlength: 30,
    },
    about: {
      type: String,
      default: 'Исследователь',
      minlength: 2,
      maxlength: 30,
    },
    avatar: {
      type: String,
      default: 'https://cdnb.artstation.com/p/assets/images/images/008/802/747/large/anton-chernoskutov-5.jpg?1515414305',
      validate: validateURL,
    },
    email: {
      type: String,
      required: [true, 'Поле "email" должно быть заполнено'],
      unique: true,
      validate: [isEmail, { message: 'Некорректный email' }],
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.model('user', userSchema);
