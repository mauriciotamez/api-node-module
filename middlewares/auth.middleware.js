const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const { promisify } = require('util')

// Utils
const { AppError } = require('../util/appError')
const { handleError } = require('../util/handleError')

dotenv.config({ path: './config.env' })

exports.validateSession = handleError(
  async (req, res, next) => {
    // Extract token from headers

    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
      // return next(new AppError(400, 'Not a valid session'))
    }

    if (!token) {
      return next(new AppError(400, 'Invalid session.'))
    }

    console.log(token)

    // Verify that token is still valid
    const validToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    )

    if (!validToken) {
      return next(new AppError(401, 'Invalid session'))
    }

    // Validate that the id that the token contains belongs to a valid user
    // Grant access
    next()
  }
)
