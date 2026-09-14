function CartPage({ cart, onRemoveFromCart, onUpdateCartQuantity }) {
  const cartTotal = cart.reduce((accumulator, item) => {
    return accumulator + item.product.price * item.quantity
  }, 0)

  return (
    <main>
      <h1>Your Cart</h1>

      <p>Cart items: {cart.length}</p>
      <p>Cart total: ${cartTotal}</p>

      <div>
        {cart.map((item) => (
          <div key={item.product._id}>
            <h2>{item.product.name}</h2>

            <p>Price: ${item.product.price}</p>
            <div>
              <button
                onClick={() =>
                  onUpdateCartQuantity(item.product._id, item.quantity - 1)
                }
              >
                −
              </button>
              <span> {item.quantity} </span>
              <button
                onClick={() =>
                  onUpdateCartQuantity(item.product._id, item.quantity + 1)
                }
              >
                +
              </button>
            </div>

            <button onClick={() => onRemoveFromCart(item.product._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

export default CartPage
