const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', (request, response) => {
  Blog
    .find({}).populate('user', { username: 1, name: 1 })
    .then(blogs => {
      response.json(blogs)
    })
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body
  const user = request.user
  const blog = new Blog({
    ...body, 
    likes: body.likes || 0, 
    user: user.id
  })
  try {
    const newBlog = await blog.save()
    await User.findByIdAndUpdate(user.id, { $push: { blogs: newBlog.id } })
    response.status(201).json(newBlog)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', async (request, response, next) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if ( user.id !== blog.user.toString()) {
    const error = new Error('Unauthorized')
    error.status = 401
    next(error)
  }
  try {
    const removedBlog = await Blog.findOneAndRemove({ _id: request.params.id, user: request.user.id })
    if (!removedBlog) {
      const error = new Error('Blog not found')
      error.status = 404
      next(error)
    } else {
      response.status(204).end()
    }
  } catch (error) {
    next(error)
  }
})

// eslint-disable-next-line no-unused-vars
blogRouter.put('/:id', async  (request, response, next) => {
  const body = request.body
  /* const body = request.body
  const user = request.user
  if (!user || !user.id) {
    return response.status(401).json({ error: 'token invalid' })
  } */
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true })
  if (!updatedBlog) {
    const error = new Error('Blog not found')
    error.status = 404
    next(error)
    /* throw new Error({ status: 404 }) */
    /* const error = new Error({ status: 404 })
    next(error) */
  }
  return response.json(updatedBlog)
})


module.exports = blogRouter