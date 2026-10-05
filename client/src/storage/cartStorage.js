const CART_KEY = 'cart'

export function loadCart() {
  const savedCart = localStorage.getItem(CART_KEY)

  if (savedCart) {
    return JSON.parse(savedCart)
  }

  return []
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}
