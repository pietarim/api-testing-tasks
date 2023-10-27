const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const getToken = async () => {
  const token = await api.post('/api/login')
    .send(helper.initialUsers[0])
  return 'bearer ' + token.body.token
}

beforeEach(async () => {
  await User.deleteMany({})
  await api
    .post('/api/users')
    .send(helper.initialUsers[0])
  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blogs are defined by id', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('a blog gets added to the database', async () => {
  const token = await getToken()
  await api
    .post('/api/blogs')
    .send(helper.newBlog)
    .set({ 'Authorization': token })
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)

})

test('a blog without likes gets 0 likes', async () => {
  const newBlog =  await api
    .post('/api/blogs')
    .send(helper.newBlogWithoutLikes)
    .set({ 'Authorization': await getToken() })
  expect(newBlog.body.likes).toBe(0)
})

test('a blog without title and url gets 400 Bad Request', async () => {
  const newBlogWithoutTitle = await api
    .post('/api/blogs')
    .send(helper.newBlogWithoutTitle)
    .set({ 'Authorization': await getToken() })
  expect(newBlogWithoutTitle.status).toBe(400)
  const blogWithoutUrl = await api
    .post('/api/blogs')
    .send(helper.newBlogWithoutUrl)
    .set({ 'Authorization': await getToken() })
  expect(blogWithoutUrl.status).toBe(400)
})

test('Cant create malformed user', async () => {
  const newUser0 = await api
    .post('/api/users')
    .send(helper.newUserMalformed)
  expect(newUser0.status).toBe(400)

  const newUser1 = await api
    .post('/api/users')
    .send(helper.newUserMalformed1)
  expect(newUser1.status).toBe(400)

  const newUser2 = await api
    .post('/api/users')
    .send(helper.newUserMalformed2)
  expect(newUser2.status).toBe(400)

  const newUser3 = await api
    .post('/api/users')
    .send(helper.newUserMalformed3)
  expect(newUser3.status).toBe(400)
})

test('Cant blog without token', async () => {
  const newBlog = await api
    .post('/api/blogs')
    .send(helper.newBlog)
  expect(newBlog.status).toBe(400)
})

afterAll(async () => {
  await mongoose.connection.close()
})