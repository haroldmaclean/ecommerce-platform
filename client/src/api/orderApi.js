const API_URL = 'https://ecommerce-platform-api-2ze0.onrender.com/api/orders'

export async function createOrder(token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create order')
    error.status = response.status
    throw error
  }

  return data
}

export async function getMyOrders(token) {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to retrieve orders')
    error.status = response.status
    throw error
  }

  return data
}

export async function getOrderById(token, orderId) {
  const response = await fetch(`${API_URL}/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to retrieve order')
    error.status = response.status
    throw error
  }

  return data
}
