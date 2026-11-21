import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'

import { updateQuantity, removeItem, setCart } from '../features/cart/cartSlice'

import { removeCartItem, updateCartItem } from '../api/cartApi'

import { getStoredToken } from '../api/authApi'

function CartPage({ onRetry }) {
  const cart = useSelector((state) => state.cart.items)
  const cartStatus = useSelector((state) => state.cart.status)
  const cartError = useSelector((state) => state.cart.error)

  const dispatch = useDispatch()

  const [updatingProducts, setUpdatingProducts] = useState({})
  const [quantityErrors, setQuantityErrors] = useState({})

  const [removingProducts, setRemovingProducts] = useState({})
  const [removeErrors, setRemoveErrors] = useState({})

  async function handleRemoveFromCart(productId) {
    if (removingProducts[productId]) return

    const storedToken = getStoredToken()

    // Guest cart: update Redux directly.
    if (!storedToken) {
      dispatch(removeItem(productId))
      return
    }

    setRemovingProducts((previous) => ({
      ...previous,
      [productId]: true,
    }))

    setRemoveErrors((previous) => ({
      ...previous,
      [productId]: '',
    }))

    // Authenticated user
    try {
      const serverCart = await removeCartItem(storedToken, productId)

      // Update Redux only after server confirmation.
      dispatch(setCart(serverCart.items || []))
    } catch (error) {
      console.error('Failed to remove item from cart:', error)

      setRemoveErrors((previous) => ({
        ...previous,
        [productId]:
          error.message || 'Unable to remove item. Please try again.',
      }))
    } finally {
      setRemovingProducts((previous) => ({
        ...previous,
        [productId]: false,
      }))
    }
  }

  async function handleQuantityChange(productId, quantity) {
    if (quantity < 1 || updatingProducts[productId]) {
      return
    }

    const storedToken = getStoredToken()

    // Anonymous user
    if (!storedToken) {
      dispatch(updateQuantity({ productId, quantity }))
      return
    }

    // Authenticated user
    setUpdatingProducts((previous) => ({
      ...previous,
      [productId]: true,
    }))

    setQuantityErrors((previous) => ({
      ...previous,
      [productId]: '',
    }))

    try {
      const serverCart = await updateCartItem(storedToken, productId, quantity)

      dispatch(setCart(serverCart.items || []))
    } catch (error) {
      console.error('Failed to update cart quantity:', error)

      setQuantityErrors((previous) => ({
        ...previous,
        [productId]:
          error.message || 'Unable to update quantity. Please try again.',
      }))
    } finally {
      setUpdatingProducts((previous) => ({
        ...previous,
        [productId]: false,
      }))
    }
  }

  const cartTotal = cart.reduce((accumulator, item) => {
    return accumulator + item.product.price * item.quantity
  }, 0)

  return (
    <main className='page-container'>
      <h1>Your Cart</h1>

      {cartStatus === 'loading' && <p>Loading your cart...</p>}

      {cartStatus === 'failed' && (
        <div>
          <p role='alert'>Unable to load your cart: {cartError}</p>

          <button onClick={onRetry}>Retry</button>
        </div>
      )}

      {cartStatus === 'succeeded' && (
        <>
          <p>Cart items: {cart.length}</p>
          <p>Cart total: R{cartTotal.toFixed(2)}</p>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className='cart-layout'>
              <div className='cart-items'>
                {cart.map((item) => {
                  const productId = item.product._id

                  return (
                    <article className='cart-item' key={productId}>
                      <div className='cart-item__image'>
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            loading='lazy'
                          />
                        ) : (
                          <div className='cart-item__image-placeholder'>
                            No image available
                          </div>
                        )}
                      </div>
                      <div className='cart-item__content'>
                        <h2>{item.product.name}</h2>

                        <p>Price: R{item.product.price.toFixed(2)}</p>

                        <div>
                          <button
                            onClick={() =>
                              handleQuantityChange(productId, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 || updatingProducts[productId]
                            }
                          >
                            −
                          </button>

                          <span> {item.quantity} </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(productId, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.product.stock ||
                              updatingProducts[productId]
                            }
                          >
                            +
                          </button>
                        </div>

                        {quantityErrors[productId] && (
                          <p role='alert'>{quantityErrors[productId]}</p>
                        )}

                        {updatingProducts[productId] && (
                          <p>Updating quantity...</p>
                        )}

                        <button
                          onClick={() => handleRemoveFromCart(productId)}
                          disabled={removingProducts[productId]}
                        >
                          {removingProducts[productId]
                            ? 'Removing...'
                            : 'Remove'}
                        </button>
                        {removeErrors[productId] && (
                          <p role='alert'>{removeErrors[productId]}</p>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
              <aside className='cart-summary'>
                <h2>Order Summary</h2>

                <div className='cart-summary__row'>
                  <span>Subtotal</span>
                  <strong>R{cartTotal.toFixed(2)}</strong>
                </div>

                <div className='cart-summary__row cart-summary__total'>
                  <span>Total</span>
                  <strong>R{cartTotal.toFixed(2)}</strong>
                </div>

                <Link to='/checkout' className='cart-summary__checkout'>
                  Proceed to Checkout
                </Link>
              </aside>
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default CartPage
