import { useEffect } from 'react'
import { getProducts } from '../api/productApi'

import ProductCard from '../components/ProductCard'

function ProductsPage({ products, setProducts, onAddToCart }) {
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
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>
    </main>
  )
}

export default ProductsPage

/*import { useEffect, useState } from 'react'
import { getProducts } from '../api/productApi'

function ProductsPage() {
  const [products, setProducts] = useState([])

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
            <h2>{product.name}</h2>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
export default ProductsPage*/
