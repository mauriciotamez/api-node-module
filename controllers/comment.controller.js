// Models
const { Comment } = require('../models/comment.model')
const { User } = require('../models/user.model')

// Utils
const { handleError } = require('../util/handleError')

exports.getAllComments = handleError(
  async (req, res, next) => {
    const comments = await Comment.findAll({
      where: { status: 'active' },
      include: [
        {
          model: User,
          attributes: { exclude: ['password'] }
        }
      ]
    })

    res.status(200).json({
      status: 'success',
      data: { comments }
    })
  }
)

exports.getCommentById = handleError(
  async (req, res, next) => {
    const { id } = req.params

    const comment = await Comment.findOne({
      where: { status: 'active', id }
    })

    if (!comment) {
      res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      })
      return
    }

    res.status(200).json({
      status: 'success',
      data: { comment }
    })
  }
)

exports.createComment = handleError(
  async (req, res, next) => {
    const { text, postId, userId } = req.body

    if (!text || !postId || !userId) {
      res.status(400).json({
        status: 'error',
        message: 'Must provide text, postId and userId'
      })
      return
    }

    const newComment = await Comment.create({
      text,
      postId,
      userId
    })

    res.status(201).json({
      status: 'success',
      data: { newComment }
    })
  }
)
