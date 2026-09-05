const errorMiddleware = (err, req, res, next) => {
  console.error(err)

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

/*const errorHandler = (err, req, res, next) => {
  console.error(err)

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
}

module.exports = errorHandler
*/
