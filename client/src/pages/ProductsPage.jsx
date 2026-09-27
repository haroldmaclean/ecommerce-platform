import { useEffect } from 'react'

import { useDispatch } from 'react-redux'
import { addItem, setCart } from '../features/cart/cartSlice'

import { getProducts } from '../api/productApi'
import { addToCart } from '../api/cartApi'
import { getStoredToken } from '../api/authApi'

import ProductCard from '../components/ProductCard'

function ProductsPage({ products, setProducts }) {
  const dispatch = useDispatch()

  async function handleAddToCart(product) {
    const storedToken = getStoredToken()

    // Anonymous user
    if (!storedToken) {
      dispatch(addItem(product))
      return
    }

    // Authenticated user
    try {
      const serverCart = await addToCart(storedToken, product._id, 1)

      console.log('Authenticated server cart:', serverCart)

      console.log('Items going into Redux:', serverCart.items)

      dispatch(setCart(serverCart.items || []))
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    }
  }

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts()

      setProducts(data)
    }

    loadProducts()
  }, [])

  return (
    <main>
      <h1>Our Products</h1>

      <p>Total products: {products.length}</p>

      <div>
        {products.map((product) => (
          <div key={product._id}>
            <ProductCard product={product} onAddToCart={handleAddToCart} />
          </div>
        ))}
      </div>
    </main>
  )
}

export default ProductsPage
