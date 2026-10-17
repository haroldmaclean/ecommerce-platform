import { useDispatch, useSelector } from 'react-redux'

import { updateQuantity, removeItem, setCart } from '../features/cart/cartSlice'

import { removeCartItem, updateCartItem } from '../api/cartApi'
import { getStoredToken } from '../api/authApi'

function CartPage({ onRetry }) {
  console.log('🔥 CartPage rendered')

  const cart = useSelector((state) => state.cart.items)

  const cartStatus = useSelector((state) => state.cart.status)
  const cartError = useSelector((state) => state.cart.error)

  console.log('CartPage Redux cart:', cart)

  const dispatch = useDispatch()

  async function handleRemoveFromCart(productId) {
    const storedToken = getStoredToken()

    // Anonymous user
    if (!storedToken) {
      dispatch(removeItem(productId))
      return
    }

    // Authenticated user
    try {
      const serverCart = await removeCartItem(storedToken, productId)

      dispatch(setCart(serverCart.items || []))
    } catch (error) {
      console.error('Failed to remove item from cart:', error)
    }
  }

  async function handleQuantityChange(productId, quantity) {
    if (quantity < 1) {
      return
    }

    const storedToken = getStoredToken()

    // Anonymous user
    if (!storedToken) {
      dispatch(
        updateQuantity({
          productId,
          quantity,
        }),
      )

      return
    }

    // Authenticated user
    try {
      const serverCart = await updateCartItem(storedToken, productId, quantity)

      dispatch(setCart(serverCart.items || []))
    } catch (error) {
      console.error('Failed to update cart quantity:', error)
    }
  }

  const cartTotal = cart.reduce((accumulator, item) => {
    return accumulator + item.product.price * item.quantity
  }, 0)

  return (
    <main>
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
          <p>Cart total: ${cartTotal}</p>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((item) => (
                <div key={item.product._id}>
                  <h2>{item.product.name}</h2>

                  <p>Price: ${item.product.price}</p>

                  <div>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity - 1,
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>

                    <span> {item.quantity} </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity + 1,
                        )
                      }
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default CartPage
