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
    return <p>Loading order details...</p>
  }

  if (error) {
    return (
      <section>
        <p role='alert'>{error}</p>
        <Link to='/orders'>Back to My Orders</Link>
      </section>
    )
  }

  if (!order) {
    return <p>Order not found.</p>
  }

  return (
    <section>
      <h2>Order Details</h2>

      <p>Order ID: {order._id}</p>

      <p>Date: {new Date(order.createdAt).toLocaleString()}</p>

      <p>Status: {order.status}</p>

      <h3>Items</h3>

      {order.items.map((item, index) => (
        <article key={`${item.product}-${index}`}>
          <h4>{item.name}</h4>

          <p>Price: R{item.price.toFixed(2)}</p>

          <p>Quantity: {item.quantity}</p>

          <p>Subtotal: R{(item.price * item.quantity).toFixed(2)}</p>
        </article>
      ))}

      <h3>Total: R{order.totalAmount.toFixed(2)}</h3>

      <Link to='/orders'>Back to My Orders</Link>
    </section>
  )
}

export default OrderDetailsPage
