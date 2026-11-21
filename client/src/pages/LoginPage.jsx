import { useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { useSelector, useDispatch } from 'react-redux'

import { useLocation, useNavigate } from 'react-router-dom'

import { setCart } from '../features/cart/cartSlice'
import { setToken, setUser } from '../features/auth/authSlice'

import { getProfile } from '../api/authApi'

import { loginWorkflow } from '../workflows/authWorkflow'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const cart = useSelector((state) => state.cart.items)

  const location = useLocation()
  const navigate = useNavigate()

  const requestedPath = location.state?.from

  const from =
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//') &&
    !requestedPath.includes('\\')
      ? requestedPath
      : '/products'

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
      dispatch(setUser(profile.user))

      console.log('Protected profile:', profile)

      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <main className='page-container auth-page'>
      <section className='auth-card'>
        <h1>Welcome Back</h1>
        <p className='auth-card__description'>
          Sign in to access your account and orders.
        </p>

        <form className='auth-form' onSubmit={handleSubmit}>
          <div className='auth-form__field'>
            <label htmlFor='login-email'>Email</label>
            <input
              id='login-email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className='auth-form__field'>
            <label htmlFor='login-password'>Password</label>

            <div className='auth-password-wrapper'>
              <input
                id='login-password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type='button'
                className='auth-password-toggle'
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button className='auth-form__submit' type='submit'>
            Login
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
