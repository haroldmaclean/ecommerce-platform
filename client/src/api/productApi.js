export async function getProducts() {
  const response = await fetch(
    'https://ecommerce-platform-api-2ze0.onrender.com/api/products',
  )
  if (!response.ok) {
    throw new Error('failed to fetch products')
  }
  return response.json()
}
