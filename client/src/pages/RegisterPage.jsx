import { useState } from 'react'
import { registerUser } from '../api/authApi'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
    <main>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name
            <input
              type='text'
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        </div>

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

        <button type='submit'>Register</button>
      </form>
    </main>
  )
}

export default RegisterPage
