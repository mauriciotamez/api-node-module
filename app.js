const express = require('express')

// Models
const { Post } = require('./models/post.model')
const { User } = require('./models/user.model')
const { Comment } = require('./models/comment.model')

// Routers
const { postsRouter } = require('./routes/posts.routes')
const { usersRouter } = require('./routes/users.routes')
const { commentsRouter } = require('./routes/comments.routes')

// Utils
const { sequelize } = require('./util/database')
const { globalErrorHandler } = require('./controllers/error.controller')
const { AppError } = require('./util/appError')

// Init express app
const app = express()

// Enable JSON incoming data
app.use(express.json())

// Endpoints
// http://localhost:4000/api/v1/posts
app.use('/api/v1/posts', postsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/comments', commentsRouter)

// Middleware to handle non valid URL's
app.use('*', (req, res, next) => {
  next(new AppError(404, `${req.originalUrl} not found in this server.`))
})

// Error handler (err => AppError)
app.use(globalErrorHandler)

sequelize
  .authenticate()
  .then(() => console.log('Database Init'))
  .catch((err) => console.log(err))

// Models relations
// 1 User <----> M Post
User.hasMany(Post)
Post.belongsTo(User)
// 1 Post <---> M Comment
Post.hasMany(Comment)
Comment.belongsTo(Post)

// 1 User <---> M Comment
User.hasMany(Comment)
Comment.belongsTo(User)

sequelize
  .sync()
  .then(() => console.log('Database synced'))
  .catch((err) => console.log(err))

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log('Express app running')
})
