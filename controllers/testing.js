const testRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testRouter.post('/reset', async (request, response) => {
  console.log('testig/reset routeri on käsitelty')
  await Blog.deleteMany({})
  await User.deleteMany({})
  response.status(204).end()
})

module.exports = testRouter