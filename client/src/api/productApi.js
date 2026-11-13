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
