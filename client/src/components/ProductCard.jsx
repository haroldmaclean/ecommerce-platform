function ProductCard({ product, onAddToCart }) {
  return (
    <div>
      <h2>{product.name}</h2>
      <p>Price: ${product.price}</p>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  )
}

export default ProductCard
