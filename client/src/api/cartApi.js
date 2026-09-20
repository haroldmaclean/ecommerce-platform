const API_URL = 'https://ecommerce-platform-api-2ze0.onrender.com/api/cart'

export async function getCart(token) {
  const response = await fetch(API_URL, {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get cart')
  }

  return data
}

export async function addToCart(token, productId, quantity) {
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      productId,
      quantity,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to add item to cart')
  }

  return data
}

export async function updateCartItem(token, productId, quantity) {
  const response = await fetch(`${API_URL}/items/${productId}`, {
    method: 'PATCH',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      quantity,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update cart item')
  }

  return data
}

export async function removeCartItem(token, productId) {
  const response = await fetch(`${API_URL}/items/${productId}`, {
    method: 'DELETE',

    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to remove cart item')
  }

  return data
}

export async function clearCart(token) {
  const response = await fetch(API_URL, {
    method: 'DELETE',

    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to clear cart')
  }

  return data
}
