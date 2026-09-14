export async function loginUser(email, password) {
  const response = await fetch(
    'https://ecommerce-platform-api-2ze0.onrender.com/api/users/login',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    },
  )

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

export async function registerUser(name, email, password) {
  const response = await fetch(
    'https://ecommerce-platform-api-2ze0.onrender.com/api/users/register',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    },
  )

  if (!response.ok) {
    throw new Error('Registration failed')
  }

  return response.json()
}
