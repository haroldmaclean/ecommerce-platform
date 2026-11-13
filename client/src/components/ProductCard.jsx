import { Link } from 'react-router-dom'

function ProductCard({ product, onAddToCart }) {
  return (
    <div>
      <h2>{product.name}</h2>

      <p>Price: R{product.price}</p>

      <Link to={`/products/${product._id}`}>View Details</Link>

      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  )
}

export default ProductCard
