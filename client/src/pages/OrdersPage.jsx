import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { getMyOrders } from '../api/orderApi'

function OrdersPage() {
  const token = useSelector((state) => state.auth.token)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function fetchOrders() {
      try {
        setLoading(true)
        setError('')

        const data = await getMyOrders(token)

        if (!ignore) {
          setOrders(data)
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || 'Unable to load your orders.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchOrders()

    return () => {
      ignore = true
    }
  }, [token])

  if (loading) {
    return <p>Loading your orders...</p>
  }

  if (error) {
    return <p role='alert'>{error}</p>
  }

  if (orders.length === 0) {
    return (
      <section>
        <h2>My Orders</h2>
        <p>You haven't placed any orders yet.</p>
        <Link to='/products'>Browse products</Link>
      </section>
    )
  }

  return (
    <section>
      <h2>My Orders</h2>

      {orders.map((order) => (
        <article key={order._id}>
          <h3>Order #{order._id}</h3>

          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>

          <p>Status: {order.status}</p>

          <p>Total: R{order.totalAmount.toFixed(2)}</p>

          <Link to={`/orders/${order._id}`}>View order</Link>
        </article>
      ))}
    </section>
  )
}

export default OrdersPage
