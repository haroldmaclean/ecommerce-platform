const API_URL = 'https://ecommerce-platform-api-2ze0.onrender.com/api/products'

export async function getProducts() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  return response.json()
}

export async function getProductById(id) {
  const response = await fetch(`${API_URL}/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch product')
  }

  return response.json()
}

export async function uploadProductImage(token, file) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_URL}/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to upload product image')
    error.status = response.status
    throw error
  }

  return data
}

export async function createProduct(token, productData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create product')
    error.status = response.status
    throw error
  }

  return data
}

export async function updateProduct(token, id, productData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update product')
    error.status = response.status
    throw error
  }

  return data
}

export async function deleteProduct(token, id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to delete product')
    error.status = response.status
    throw error
  }

  return data
}
