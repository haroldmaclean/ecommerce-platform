import { useState } from 'react'
import { useSelector } from 'react-redux'

import { createOrder } from '../api/orderApi'
import { createPayment } from '../api/paymentApi'

function CheckoutPage() {
  const token = useSelector((state) => state.auth.token)

  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCheckout() {
    if (!token) {
      setError('You must be logged in to continue.')
      return
    }

    if (payment) return

    setLoading(true)
    setError(null)

    try {
      // Step 1: Create the order if one does not already exist.
      let currentOrder = order

      if (!currentOrder) {
        currentOrder = await createOrder(token)
        setOrder(currentOrder)
      }

      // Step 2: Create payment using the order ID.
      const paymentData = await createPayment(token, currentOrder._id)

      setPayment(paymentData.payment)
      setClientSecret(paymentData.clientSecret)
    } catch (error) {
      console.error('Checkout failed:', error)
      setError(error.message || 'Unable to complete checkout.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Checkout</h1>

      {!order && <p>Ready to create your order and proceed to payment?</p>}

      {order && (
        <section>
          <h2>Order created successfully</h2>
          <p>Order ID: {order._id}</p>
          <p>Order status: {order.status}</p>
        </section>
      )}

      {payment && (
        <section>
          <h2>Payment created successfully</h2>
          <p>Payment status: {payment.status}</p>
          <p>Stripe client secret received: {clientSecret ? 'Yes' : 'No'}</p>
        </section>
      )}

      {error && <p role='alert'>{error}</p>}

      {!payment && (
        <button type='button' onClick={handleCheckout} disabled={loading}>
          {loading
            ? 'Processing...'
            : order
              ? 'Retry payment creation'
              : 'Create order and payment'}
        </button>
      )}
    </main>
  )
}

export default CheckoutPage
