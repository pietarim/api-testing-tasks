const Blog = require('../models/blog')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const initialUsers = [
  {
    username: 'Risto Peltonen',
    name: 'Superuser',
    password: 'salainen'
  }
]

const newUserMalformed = {
  username: 'newUser',
  name: 'New User',
  password: '12'
}

const newUserMalformed1 = {
  username: 'ne',
  name: 'New User',
  password: '123456'
}

const newUserMalformed2 = {
  username: 'newUser',
  name: 'New User',
}

const newUserMalformed3 = {
  name: 'New User',
  password: '123456'
}

const newBlogWithoutTitle = {
  author: 'Edsger W. Dijkstra',
  url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  likes: 5
}

const newBlogWithoutUrl = {
  title: 'City of Thieves',
  author: 'David Benioff',
  likes: 3
}

const newBlog = {
  title: 'Canonical string reduction',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
  likes: 12
}

const newBlogWithoutLikes = {
  title: 'New Blog Without Likes',
  author: 'Edsger W. Dijkstra',
  url: 'https://mongoosejs.com/docs/validation.html#custom-validators'
}

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  newBlogWithoutLikes,
  newBlogWithoutUrl,
  newBlog,
  newBlogWithoutTitle,
  newUserMalformed,
  newUserMalformed1,
  newUserMalformed2,
  newUserMalformed3
}