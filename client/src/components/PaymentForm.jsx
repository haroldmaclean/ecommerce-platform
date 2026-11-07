import { useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!stripe || !elements || loading) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required',
      })

      if (result.error) {
        setError(result.error.message)
        return
      }

      if (result.paymentIntent?.status === 'succeeded') {
        setMessage('Payment submitted successfully. Confirming your order...')
      } else {
        setMessage(
          `Payment status: ${result.paymentIntent?.status || 'processing'}`,
        )
      }
    } catch (error) {
      setError(error.message || 'Payment could not be completed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      {error && <p role='alert'>{error}</p>}

      {message && <p role='status'>{message}</p>}

      <button type='submit' disabled={!stripe || !elements || loading}>
        {loading ? 'Processing payment...' : 'Pay now'}
      </button>
    </form>
  )
}

export default PaymentForm
