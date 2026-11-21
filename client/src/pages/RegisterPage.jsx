import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { registerUser } from '../api/authApi'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const result = await registerUser(name, email, password)

      console.log('Registration successful:', result)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <main className='page-container auth-page'>
      <section className='auth-card'>
        <h1>Create Account</h1>
        <p className='auth-card__description'>
          Create an account to get started.
        </p>

        <form className='auth-form' onSubmit={handleSubmit}>
          <div className='auth-form__field'>
            <label htmlFor='name'>Name</label>
            <input
              id='name'
              type='text'
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className='auth-form__field'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className='auth-form__field'>
            <label htmlFor='password'>Password</label>

            <div className='auth-password-wrapper'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                className='auth-password-toggle'
                type='button'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button className='auth-form__submit' type='submit'>
            Register
          </button>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage
