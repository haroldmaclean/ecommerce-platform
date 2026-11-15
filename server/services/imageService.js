const cloudinary = require('../config/cloudinary')

const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ecommerce-products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }

        resolve(result)
      },
    )

    uploadStream.end(fileBuffer)
  })
}

module.exports = {
  uploadImage,
}
