import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { getOrderById } from '../api/orderApi'

function OrderDetailsPage() {
  const { orderId } = useParams()

  const token = useSelector((state) => state.auth.token)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function fetchOrder() {
      try {
        setLoading(true)
        setError('')

        const data = await getOrderById(token, orderId)

        if (!ignore) {
          setOrder(data)
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || 'Unable to load order details.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchOrder()

    return () => {
      ignore = true
    }
  }, [token, orderId])

  if (loading) {
    return (
      <main className='page-container'>
        <p className='order-details-message'>Loading order details...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className='page-container'>
        <p
          className='order-details-message order-details-message--error'
          role='alert'
        >
          {error}
        </p>
        <Link className='orders-link' to='/orders'>
          Back to My Orders
        </Link>
      </main>
    )
  }

  if (!order) {
    return (
      <main className='page-container'>
        <p className='order-details-message'>Order not found.</p>
        <Link className='orders-link' to='/orders'>
          Back to My Orders
        </Link>
      </main>
    )
  }

  return (
    <main className='page-container'>
      <h1>Order Details</h1>

      <section className='order-details-card'>
        <div className='order-details-card__header'>
          <div>
            <span className='order-details-label'>Order ID</span>
            <p className='order-details-id'>{order._id}</p>
          </div>

          <span
            className={`order-card__status order-card__status--${order.status}`}
          >
            {order.status}
          </span>
        </div>

        <p className='order-details-date'>
          <span>Date placed</span>
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </section>

      <section className='order-details-items'>
        <h2>Items</h2>

        {order.items.map((item, index) => (
          <article
            className='order-details-item'
            key={`${item.product}-${index}`}
          >
            <h3>{item.name}</h3>

            <div className='order-details-item__row'>
              <span>Price</span>
              <span>R{item.price.toFixed(2)}</span>
            </div>

            <div className='order-details-item__row'>
              <span>Quantity</span>
              <span>{item.quantity}</span>
            </div>

            <div className='order-details-item__row'>
              <span>Subtotal</span>
              <span>R{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </article>
        ))}

        <div className='order-details-total'>
          <span>Total</span>
          <strong>R{order.totalAmount.toFixed(2)}</strong>
        </div>
      </section>

      <Link className='orders-link order-details-back' to='/orders'>
        Back to My Orders
      </Link>
    </main>
  )
}

export default OrderDetailsPage
