import { loginUser } from '../api/authApi'
import { mergeCart, getCart } from '../api/cartApi'

export async function loginWorkflow(email, password, anonymousCart) {
  const result = await loginUser(email, password)

  const mergeItems = anonymousCart.map((item) => ({
    productId: item.product._id,
    quantity: item.quantity,
  }))
  let authenticatedCart
  if (mergeItems.length > 0) {
    authenticatedCart = await mergeCart(result.token, mergeItems)
  } else {
    authenticatedCart = await getCart(result.token)
  }
  return {
    token: result.token,
    cart: authenticatedCart.items || [],
  }
}
