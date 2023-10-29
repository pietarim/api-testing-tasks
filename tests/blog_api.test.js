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
  const user = await api
    .post('/api/users')
    .send(helper.initialUsers[0])
  await Blog.deleteMany({})

  let blogObject = new Blog({ ...helper.initialBlogs[0], user: user.body.id })
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .set({ 'Authorization': await getToken() })
    .expect('Content-Type', /application\/json/)
})

test('blogs are defined by id', async () => {
  const response = await api
    .get('/api/blogs')
    .set({ 'Authorization': await getToken() })
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

test('a blog without likes defaults to 0 likes', async () => {
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
  expect(newUser0.body.error).toBe('password must be at least 3 characters long')

  const newUser1 = await api
    .post('/api/users')
    .send(helper.newUserMalformed1)
  expect(newUser1.status).toBe(400)
  expect(newUser1.body.error).toBe('username must be at least 3 characters long')

  const newUser2 = await api
    .post('/api/users')
    .send(helper.newUserMalformed2)
  expect(newUser2.status).toBe(400)
  expect(newUser2.body.error).toBe('password is required')

  const newUser3 = await api
    .post('/api/users')
    .send(helper.newUserMalformed3)
  expect(newUser3.status).toBe(400)
  expect(newUser3.body.error).toBe('username is required')

  const newUser4 = await api
    .post('/api/users')
    .send(helper.newUserMalformed4)
  expect(newUser4.status).toBe(409)
  expect(newUser4.body.error).toBe('username must be unique')
})

test('Cant blog without token', async () => {
  const newBlog = await api
    .post('/api/blogs')
    .send(helper.newBlog)
  expect(newBlog.status).toBe(401)
})

test('Blog can be deleted', async () => {
  const blogs = await helper.blogsInDb()
  const blogToDelete = blogs[0]
  const token = await getToken()
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set({ 'Authorization': token })
    .expect(204)
  const blogsAfterDelete = await helper.blogsInDb()
  expect(blogsAfterDelete.length).toBe(helper.initialBlogs.length - 1)
})

test('Blog can be updated', async () => {
  const blogs = await helper.blogsInDb()
  const blog = blogs[0]
  const likedBolog = { ...blog, likes: blog.likes + 1 }
  const updatedBlog = await api
    .put(`/api/blogs/${blog.id}`)
    .set({ 'Authorization': await getToken() })
    .send(likedBolog)
    .expect(200)
  expect(updatedBlog.body.likes).toBe(blog.likes + 1)
})

afterAll(async () => {
  await mongoose.connection.close()
})