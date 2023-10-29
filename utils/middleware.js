const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error)
  if (error.message.includes('Error, expected `username` to be unique')) {
    return response.status(409).json({ error: 'username must be unique' })
  }
  if (error.message.includes('is shorter than the minimum allowed length (3).')) {
    return response.status(400).json({ error: 'username must be at least 3 characters long' })
  }
  if (error.message === 'invalid token') {
    return response.status(401).json({ error: error.message })
  }
  if (error.status === 401) {
    return response.status(401).json({ error: error.message || 'token invalid' })
  }
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else {
    return response.status(400).json({ error: error.message })
  }
  // eslint-disable-next-line no-unreachable
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('Authorization')
  try {
    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
      request.token = authorization.substring(7)
    }
  } catch (error) {
    next(error)
  }
  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token
  if (!token) {
    const error = new Error('invalid token')
    error.status = 401
    return next(error)
  }
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      const error = new Error('invalid token')
      next(error)
    }
    const user = await User.findById(decodedToken.id)
    if (!user) {
      const error = new Error('invalid token')
      error.status = 401
      return next(error)
    }
    request.user = user
  } catch {
    const error = new Error('invalid token')
    error.status = 401
    return next(error)
  }
    

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}