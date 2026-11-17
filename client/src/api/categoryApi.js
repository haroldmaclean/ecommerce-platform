const API_URL =
  'https://ecommerce-platform-api-2ze0.onrender.com/api/categories'

export async function getCategories() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }

  return response.json()
}
