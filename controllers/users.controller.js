const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

// Models
const { Comment } = require('../models/comment.model')
const { Post } = require('../models/post.model')
const { User } = require('../models/user.model')

// Utils
const { filterObj } = require('../util/filterObj')
const { handleError } = require('../util/handleError')
const { AppError } = require('../util/appError')

dotenv.config({ path: './config.env' })

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: 'active' },
      include: [
        {
          model: Post,
          include: [
            {
              model: Comment,
              include: [{ model: User }]
            }
          ]
        },
        {
          model: Comment,
          include: [{ model: Post }]
        }
      ]
    })

    res.status(200).json({
      status: 'success',
      data: { users }
    })
  } catch (error) {
    console.log(error)
  }
}

// Get user by ID
exports.getUserById = handleError(
  async (req, res, next) => {
    const { id } = req.params

    const user = await User.findOne({
      where: { id }
    })

    if (!user) {
      return next(new AppError(404, 'User not found'))
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    })
  }
)

// Save new user
exports.createNewUser = handleError(
  async (req, res, next) => {
    const { name, email, password } = req.body

    // If any of the fields that requires the createNewUser fn
    // doesn't reach to us throw an error
    if (!name || !email || !password) {
      return next(
        new AppError(
          404,
          'Must provide a name, email and password'
        )
      )
    }

    // Generate salt for the bcrypt.hash fn
    const salt = await bcrypt.genSalt(12)

    // Generate a hashed password
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    })

    newUser.password = undefined

    res.status(201).json({
      status: 'success',
      data: { newUser }
    })
  }
)

// Update user (patch)
exports.updateUser = (req, res) => {
  const { id } = req.params
  const data = filterObj(req.body, 'name', 'age')

  // const userIndex = users.findIndex(user => user.id === +id);

  // if (userIndex === -1) {
  // 	res.status(404).json({
  // 		status: 'error',
  // 		message: 'Cant update user, not a valid ID',
  // 	});
  // 	return;
  // }

  // let updatedUser = users[userIndex];

  // updatedUser = { ...updatedUser, ...data };

  // users[userIndex] = updatedUser;

  res.status(204).json({ status: 'success' })
}

// Delete user
exports.deleteUser = (req, res) => {
  const { id } = req.params

  // const userIndex = users.findIndex(user => user.id === +id);

  // if (userIndex === -1) {
  // 	res.status(404).json({
  // 		status: 'error',
  // 		message: 'Cant delete user, invalid ID',
  // 	});
  // 	return;
  // }

  // users.splice(userIndex, 1);

  res.status(204).json({ status: 'success' })
}

exports.loginUser = handleError(async (req, res, next) => {
  const { email, password } = req.body

  // Find user given an email and a status 'active'
  const user = await User.findOne({
    where: { email, status: 'active' }
  })

  // Compare req.body password (User password) vs hashed user password
  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return next(new AppError(400, 'Credentials invalid'))
  }

  // Create JWT
  const token = await jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  )

  res.status(200).json({
    status: 'success',
    data: { token }
  })
})
