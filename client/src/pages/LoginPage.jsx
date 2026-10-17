import { useState } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { setCart } from '../features/cart/cartSlice'
import { setToken } from '../features/auth/authSlice'

import { getProfile } from '../api/authApi'

import { loginWorkflow } from '../workflows/authWorkflow'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const cart = useSelector((state) => state.cart.items)

  const dispatch = useDispatch()

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const anonymousCart = [...cart]

      const result = await loginWorkflow(email, password, anonymousCart)

      console.log('Login successful:', result)

      dispatch(setCart(result.cart))

      localStorage.removeItem('cart')

      localStorage.setItem('token', result.token)

      dispatch(setToken(result.token))

      const profile = await getProfile(result.token)

      console.log('Protected profile:', profile)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type='submit'>Login</button>
      </form>
    </main>
  )
}

export default LoginPage
