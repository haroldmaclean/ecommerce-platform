import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getProductById } from '../api/productApi'

function ProductDetailsPage() {
  const { productId } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

      <Link to='/products'>Back to Products</Link>
    </section>
  )
}

export default ProductDetailsPage
