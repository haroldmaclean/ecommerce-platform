import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getProductById } from '../api/productApi'

import { useDispatch } from 'react-redux'

import { addItem, setCart } from '../features/cart/cartSlice'
import { addToCart } from '../api/cartApi'
import { getStoredToken } from '../api/authApi'

function ProductDetailsPage() {
  const { productId } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dispatch = useDispatch()

  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')

  async function handleAddToCart() {
    const storedToken = getStoredToken()

    setCartMessage('')
    setCartError('')

    // Guest customer
    if (!storedToken) {
      dispatch(addItem(product))
      setCartMessage('Product added to cart.')
      return
    }

    // Authenticated customer
    try {
      const serverCart = await addToCart(storedToken, product._id, 1)

      dispatch(setCart(serverCart.items || []))

      setCartMessage('Product added to cart.')
    } catch (error) {
      setCartError(error.message || 'Failed to add product to cart.')
    }
  }

  useEffect(() => {
    let ignore = false

    async function fetchProduct() {
      try {
        setLoading(true)
        setError('')

        const data = await getProductById(productId)

        if (!ignore) {
          setProduct(data)
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || 'Unable to load product details.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      ignore = true
    }
  }, [productId])

  if (loading) {
    return <p>Loading product details...</p>
  }

  if (error) {
    return (
      <section>
        <p role='alert'>{error}</p>
        <Link to='/products'>Back to Products</Link>
      </section>
    )
  }

  if (!product) {
    return <p>Product not found.</p>
  }

  return (
    <section>
      <h1>{product.name}</h1>

      <p>Price: R{product.price.toFixed(2)}</p>

      <p>Description: {product.description}</p>

      <p>Category: {product.category?.name || 'Uncategorized'}</p>

      <p>Available stock: {product.stock - product.reservedStock}</p>

      <button
        onClick={handleAddToCart}
        disabled={product.stock - (product.reservedStock || 0) <= 0}
      >
        Add to Cart
      </button>
      {cartMessage && <p role='status'>{cartMessage}</p>}

      {cartError && <p role='alert'>{cartError}</p>}

      <Link to='/products'>Back to Products</Link>
    </section>
  )
}

export default ProductDetailsPage
