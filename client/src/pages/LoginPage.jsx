import { useState } from 'react'
import { loginUser } from '../api/authApi'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const result = await loginUser(email, password)

      console.log('Login successful:', result)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            Password
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>

        <button type='submit'>Login</button>
      </form>
    </main>
  )
}

export default LoginPage
