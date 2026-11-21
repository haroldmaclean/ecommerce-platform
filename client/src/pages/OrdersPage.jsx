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
    return (
      <main className='page-container'>
        <p className='orders-message'>Loading your orders...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className='page-container'>
        <p className='orders-message orders-message--error' role='alert'>
          {error}
        </p>
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main className='page-container'>
        <h1>My Orders</h1>
        <div className='orders-empty'>
          <p>You haven't placed any orders yet.</p>
          <Link className='orders-link' to='/products'>
            Browse products
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className='page-container'>
      <h1>My Orders</h1>
      <div className='orders-list'>
        {orders.map((order) => (
          <article className='order-card' key={order._id}>
            <div className='order-card__header'>
              <h2>Order #{order._id}</h2>
              <span
                className={`order-card__status order-card__status--${order.status}`}
              >
                {order.status}
              </span>
            </div>

            <div className='order-card__details'>
              <p>
                <span>Date placed</span>
                {new Date(order.createdAt).toLocaleDateString()}
              </p>

              <p>
                <span>Total</span>R{order.totalAmount.toFixed(2)}
              </p>
            </div>

            <Link className='orders-link' to={`/orders/${order._id}`}>
              View order
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export default OrdersPage
