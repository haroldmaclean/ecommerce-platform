import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { getAllOrders, updateOrderStatus } from '../api/orderApi'

const nextStatus = {
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
}

function AdminOrdersPage() {
  const token = useSelector((state) => state.auth.token)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    let ignore = false

    async function fetchOrders() {
      try {
        setLoading(true)
        setError('')

        const data = await getAllOrders(token)

        if (!ignore) {
          setOrders(data)
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || 'Unable to load orders.')
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

  async function handleStatusUpdate(orderId, status) {
    try {
      setUpdatingOrderId(orderId)
      setActionError('')

      const updatedOrder = await updateOrderStatus(token, orderId, status)

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? updatedOrder : order,
        ),
      )
    } catch (error) {
      setActionError(error.message || 'Unable to update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (loading) {
    return <p>Loading all orders...</p>
  }

  if (error) {
    return <p role='alert'>{error}</p>
  }

  return (
    <section>
      <h2>Admin - Order Management</h2>

      <p>Total orders: {orders.length}</p>

      {actionError && <p role='alert'>{actionError}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <article key={order._id}>
            <h3>Order #{order._id}</h3>

            <p>Customer: {order.user?.name || 'Unknown customer'}</p>

            <p>Email: {order.user?.email || 'Unavailable'}</p>

            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>

            <h4>Items</h4>

            <ul>
              {order.items.map((item, index) => (
                <li key={`${item.product}-${index}`}>
                  {item.name} - R{item.price.toFixed(2)} x {item.quantity}
                </li>
              ))}
            </ul>

            <p>Total: R{order.totalAmount.toFixed(2)}</p>

            <p>Status: {order.status}</p>

            <p>Reservation: {order.reservationStatus}</p>

            {nextStatus[order.status] && (
              <button
                onClick={() =>
                  handleStatusUpdate(order._id, nextStatus[order.status])
                }
                disabled={updatingOrderId !== null}
              >
                {updatingOrderId === order._id
                  ? 'Updating...'
                  : `Mark as ${nextStatus[order.status]}`}
              </button>
            )}
          </article>
        ))
      )}
    </section>
  )
}

export default AdminOrdersPage
