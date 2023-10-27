const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = ( blogs ) => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.reduce((acc, cur) => {
    return acc + cur.likes
  }, 0)
  return likes
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((acc, cur) => {
    return acc.likes > cur.likes ? acc : cur})
  return favorite
}

const mostBlogs = (blogs) => {
  const authors = blogs.map(blog => blog.author)
  const authorCount = _.countBy(authors)
  const authorCountPairs = _.toPairs(authorCount)
  const mostBloggingAuthor = _.maxBy(authorCountPairs, pair => pair[1])
  return { author: mostBloggingAuthor[0], blogs: mostBloggingAuthor[1] }
}

const mostLikes = (blogs) => {
  const groupByAuthor = _.groupBy(blogs, 'author')
  const authors = Object.keys(groupByAuthor)
  const authorsAndTheirLikes = authors.map(author => {
    const likes = _.sumBy(groupByAuthor[author], 'likes')
    return { author: author, likes: likes }
  })
  const mostLikedAuthor = _.maxBy(authorsAndTheirLikes, 'likes')
  return mostLikedAuthor
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}