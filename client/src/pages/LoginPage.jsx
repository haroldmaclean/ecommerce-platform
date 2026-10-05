import { useState } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { setCart } from '../features/cart/cartSlice'
import { setToken } from '../features/auth/authSlice'

import { loginUser, getProfile } from '../api/authApi'

import { getCart, mergeCart } from '../api/cartApi'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const cart = useSelector((state) => state.cart.items)

  const dispatch = useDispatch()

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      /*
       * 1. Login
       */
      const result = await loginUser(email, password)

      console.log('Login successful:', result)

      /*
       * 2. Preserve the anonymous cart
       */
      const anonymousCart = [...cart]

      /*
       * 3. Merge anonymous cart into
       *    the authenticated user's server cart
       */
      const mergeItems = anonymousCart.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      }))

      await mergeCart(result.token, mergeItems)

      /*
       * 4. Get the final server cart
       */
      const serverCart = await getCart(result.token)

      console.log('Authenticated cart:', serverCart)

      /*
       * 5. Server becomes the source of truth
       */
      dispatch(setCart(serverCart.items || []))
      //setCart(serverCart.items || [])

      /*
       * 6. Remove the anonymous copy
       */
      localStorage.removeItem('cart')

      /*
       * 7. NOW mark React as authenticated
       *
       * This happens last deliberately.
       */
      localStorage.setItem('token', result.token)

      dispatch(setToken(result.token))

      /*
       * 8. Verify protected identity
       */
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
