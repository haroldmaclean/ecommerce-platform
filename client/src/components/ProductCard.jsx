import { Link } from 'react-router-dom'

function ProductCard({ product, onAddToCart }) {
  return (
    <article className='product-card'>
      <div className='product-card__image'>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading='lazy' />
        ) : (
          <div className='product-card__image-placeholder'>
            No image available
          </div>
        )}
      </div>

      <div className='product-card__content'>
        <h2>{product.name}</h2>

        <p className='product-card__price'>
          R{Number(product.price).toFixed(2)}
        </p>

        <Link className='product-card__details' to={`/products/${product._id}`}>
          View Details
        </Link>

        <button onClick={() => onAddToCart(product)}>Add to Cart</button>
      </div>
    </article>
  )
}

export default ProductCard
