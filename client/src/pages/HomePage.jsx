import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ArrowRight } from 'lucide-react'

import { addItem, setCart } from '../features/cart/cartSlice'
import { getProducts } from '../api/productApi'
import { getCategories } from '../api/categoryApi'
import { addToCart } from '../api/cartApi'
import { getStoredToken } from '../api/authApi'

import ProductCard from '../components/ProductCard'

function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [error, setError] = useState('')
  const [categoriesError, setCategoriesError] = useState('')

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
      dispatch(setCart(serverCart.items || []))
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    }
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to load home page products:', error)
        setError('Unable to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
        setCategoriesError('Unable to load categories.')
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  const featuredProducts = products.slice(0, 4)

  return (
    <main className='page-container'>
      {/* Hero */}
      <section className='home-hero'>
        <div className='home-hero__content'>
          <span className='home-hero__eyebrow'>Welcome to our store</span>

          <h1>Gear Up for Your Next Level</h1>

          <p>
            Discover quality gaming laptops and accessories designed to elevate
            your gaming experience.
          </p>

          <Link to='/products' className='home-hero__button'>
            Explore Products
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className='home-featured'>
        <div className='home-section-header'>
          <div>
            <span className='home-section-eyebrow'>Our collection</span>
            <h2>Featured Products</h2>
            <p>Discover some of our available gaming products.</p>
          </div>

          <Link to='/products' className='home-section-link'>
            View All Products
          </Link>
        </div>

        {loading && <p>Loading featured products...</p>}

        {error && <p className='home-error'>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products are currently available.</p>
        )}

        {!loading && !error && featuredProducts.length > 0 && (
          <div className='products-grid'>
            {featuredProducts.map((product) => (
              <div key={product._id}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shop by Category */}
      <section className='home-categories'>
        <div className='home-section-header'>
          <div>
            <span className='home-section-eyebrow'>Browse our store</span>
            <h2>Shop by Category</h2>
            <p>Find products that match your interests.</p>
          </div>
        </div>

        {categoriesLoading && <p>Loading categories...</p>}

        {categoriesError && <p className='home-error'>{categoriesError}</p>}

        {!categoriesLoading && !categoriesError && categories.length === 0 && (
          <p>No categories are currently available.</p>
        )}

        {!categoriesLoading && !categoriesError && categories.length > 0 && (
          <div className='home-categories__grid'>
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className='home-category-card'
              >
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Explore this category'}</p>
                </div>

                <ArrowRight size={20} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default HomePage
