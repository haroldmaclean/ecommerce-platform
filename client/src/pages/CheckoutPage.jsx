import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { createOrder, getOrderById } from '../api/orderApi'
import { createPayment, getPaymentByOrderId } from '../api/paymentApi'

import { Elements } from '@stripe/react-stripe-js'

import { stripePromise } from '../config/stripe'
import PaymentForm from '../components/PaymentForm'

function CheckoutPage() {
  const token = useSelector((state) => state.auth.token)

  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)

  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [verificationMessage, setVerificationMessage] = useState(null)

  const pollingRef = useRef(false)

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
        const orderData = await createOrder(token)
        currentOrder = orderData.order || orderData
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

  async function handlePaymentSucceeded() {
    if (pollingRef.current || !order?._id || !token) return

    pollingRef.current = true
    setVerifying(true)
    setError(null)
    setVerificationMessage(
      'Payment received by Stripe. Checking confirmation with our server...',
    )

    try {
      const maxAttempts = 15
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Retrieve the latest records from our backend.
        const [orderData, paymentData] = await Promise.all([
          getOrderById(token, order._id),
          getPaymentByOrderId(token, order._id),
        ])

        const latestOrder = orderData.order || orderData
        const latestPayment = paymentData.payment || paymentData

        setOrder(latestOrder)
        setPayment(latestPayment)

        // Both records must confirm successful finalization.
        if (
          latestOrder.status === 'confirmed' &&
          latestOrder.reservationStatus === 'finalized' &&
          latestPayment.status === 'succeeded' &&
          latestPayment.refundStatus === 'not_required'
        ) {
          setVerificationMessage('Payment successful! Your order is confirmed.')
          return
        }

        // The payment succeeded but a refund was issued.
        if (latestPayment.refundStatus === 'succeeded') {
          setVerificationMessage(
            'Payment was received, but the order could not be finalized. A refund has been issued.',
          )
          return
        }

        if (latestPayment.refundStatus === 'failed') {
          setVerificationMessage(
            'Payment was received, but order finalization failed and the refund needs attention. Please contact support.',
          )
          return
        }

        if (latestPayment.status === 'failed') {
          setVerificationMessage('The payment was unsuccessful.')
          return
        }

        if (attempt < maxAttempts - 1) {
          await delay(2000)
        }
      }

      setVerificationMessage(
        'We are still waiting for confirmation. Please check your order status again shortly. Do not submit another payment.',
      )
    } catch (error) {
      console.error('Payment verification failed:', error)
      setError(
        error.message ||
          'Unable to retrieve the latest payment and order status.',
      )
    } finally {
      pollingRef.current = false
      setVerifying(false)
    }
  }

  return (
    <main>
      <h1>Checkout</h1>

      {!order && <p>Ready to create your order and proceed to payment?</p>}

      {order && (
        <section>
          <h2>Order details</h2>
          <p>Order ID: {order._id}</p>
          <p>Order status: {order.status}</p>
          <p>Reservation status: {order.reservationStatus}</p>
        </section>
      )}

      {payment && (
        <section>
          <h2>Payment details</h2>
          <p>Payment status: {payment.status}</p>
          <p>Refund status: {payment.refundStatus}</p>
        </section>
      )}

      {error && <p role='alert'>{error}</p>}

      {verificationMessage && <p role='status'>{verificationMessage}</p>}

      {!payment && (
        <button type='button' onClick={handleCheckout} disabled={loading}>
          {loading
            ? 'Processing...'
            : order
              ? 'Retry payment creation'
              : 'Create order and payment'}
        </button>
      )}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
          key={payment?._id}
        >
          <PaymentForm onPaymentSucceeded={handlePaymentSucceeded} />
        </Elements>
      )}

      {verifying && <p>Verifying payment with the server...</p>}
    </main>
  )
}

export default CheckoutPage
