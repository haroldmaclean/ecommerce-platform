const errorMiddleware = (err, req, res, next) => {
  console.error(err)

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID',
    })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
}

module.exports = errorMiddleware
