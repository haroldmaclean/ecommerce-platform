import { useEffect } from 'react'
import { getProducts } from '../api/productApi'

function ProductsPage() {
  useEffect(() => {
    async function loadProducts() {
      const products = await getProducts()

      console.log(products)
    }

    loadProducts()
  }, [])
  return (
    <main>
      <h1>Our Products</h1>
      <p>Browse everything in our store.</p>
    </main>
  )
}
export default ProductsPage
