const API_URL = 'https://ecommerce-platform-api-2ze0.onrender.com/api/payments'

export async function createPayment(token, orderId) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create payment')
    error.status = response.status
    throw error
  }

  return data
}

export async function getPaymentByOrderId(token, orderId) {
  const response = await fetch(`${API_URL}/order/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to retrieve payment')
    error.status = response.status
    throw error
  }

  return data
}
