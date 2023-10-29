const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.get('/', async (req, res) => {
  // eslint-disable-next-line no-undef
  const user = await User.find({}, 'username name').populate('blogs')
  res.json(user)
})

// eslint-disable-next-line no-unused-vars
userRouter.post('/', async (req, res, next) => {
  const { password, name, username } = req.body
  if (!password) {
    throw new Error('password is required')
  }
  if (password.length < 3) {
    throw new Error('password must be at least 3 characters long')
  }
  if (!username) {
    throw new Error('username is required')
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const user = new User({
    username,
    name,
    passwordHash
  })
  const savedUser = await user.save()
  res.json(savedUser)
})

module.exports = userRouter