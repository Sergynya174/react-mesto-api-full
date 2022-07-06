const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { validateURL } = require('../utils/error-codes');
const {
  getUsers,
  getUserProfile,
  getUser,
  patchUserProfile,
  patchUserAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUserProfile);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  patchUserProfile,
);

router.patch(
  '/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().custom(validateURL),
    }),
  }),
  patchUserAvatar,
);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), getUser);

module.exports.userRouter = router;
