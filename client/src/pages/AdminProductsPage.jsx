import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../api/productApi'

import { getCategories } from '../api/categoryApi'

function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = useSelector((state) => state.auth.token)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
  })

  const [image, setImage] = useState(null)

  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProductId, setDeletingProductId] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [productData, categoryData] = await Promise.all([
          getProducts(),
          getCategories(),
        ])

        if (!ignore) {
          setProducts(productData)
          setCategories(categoryData)
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message || 'Unable to load products.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  function getCategoryName(product) {
    if (typeof product.category === 'object' && product.category !== null) {
      return product.category.name
    }

    const category = categories.find(
      (category) => category._id === product.category,
    )

    return category?.name || 'Uncategorized'
  }

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    )

    if (!confirmed) return

    try {
      setDeletingProductId(product._id)
      setFormError('')
      setSuccessMessage('')

      await deleteProduct(token, product._id)

      setProducts((current) =>
        current.filter((item) => item._id !== product._id),
      )

      if (editingProduct?._id === product._id) {
        setEditingProduct(null)
        setFormData({
          name: '',
          price: '',
          description: '',
          category: '',
          stock: '',
        })
        setImage(null)
      }

      setSuccessMessage('Product deleted successfully!')
    } catch (error) {
      setFormError(error.message || 'Failed to delete product.')
    } finally {
      setDeletingProductId(null)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget

    try {
      setSubmitting(true)
      setFormError('')
      setSuccessMessage('')

      let imageUrl = ''

      // 1. Upload the image if one was selected
      if (image) {
        const uploadResult = await uploadProductImage(token, image)
        imageUrl = uploadResult.imageUrl
      }

      // 2. Prepare product data for the backend
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        ...(imageUrl && { imageUrl }),
      }

      // 3. Create or update the product
      if (editingProduct) {
        const updatedProduct = await updateProduct(
          token,
          editingProduct._id,
          productData,
        )

        setProducts((current) =>
          current.map((product) =>
            product._id === updatedProduct._id ? updatedProduct : product,
          ),
        )
      } else {
        const newProduct = await createProduct(token, productData)

        setProducts((current) => [newProduct, ...current])
      }
      // 5. Reset the form
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
      })

      setImage(null)
      setEditingProduct(null)
      form.reset()

      setSuccessMessage(
        editingProduct
          ? 'Product updated successfully!'
          : 'Product created successfully!',
      )
    } catch (error) {
      setFormError(error.message || 'Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(product) {
    setEditingProduct(product)

    setFormData({
      name: product.name,
      price: String(product.price),
      description: product.description || '',
      category:
        typeof product.category === 'object'
          ? product.category._id
          : product.category || '',
      stock: String(product.stock),
    })

    setImage(null)
    setFormError('')
    setSuccessMessage('')
  }

  if (loading) {
    return <p>Loading products...</p>
  }

  if (error) {
    return <p role='alert'>{error}</p>
  }

  return (
    <main className='page-container'>
      <h2>Admin - Product Management</h2>
      <section className='admin-product-form'>
        <form className='admin-product-form__form' onSubmit={handleSubmit}>
          <h3 className='admin-product-form__title'>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>

          <label className='admin-product-form__field'>
            Product Name
            <input
              className='admin-product-form__input'
              type='text'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </label>

          <label className='admin-product-form__field'>
            Price (R)
            <input
              className='admin-product-form__input'
              type='number'
              name='price'
              min='0.01'
              step='0.01'
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </label>

          <label className='admin-product-form__field'>
            Description
            <textarea
              className='admin-product-form__textarea'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </label>

          <label className='admin-product-form__field'>
            Category
            <select
              name='category'
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value=''>Select category</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className='admin-product-form__field'>
            Stock Quantity
            <input
              className='admin-product-form__input'
              type='number'
              name='stock'
              min='0'
              step='1'
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
          </label>

          <label className='admin-product-form__field'>
            Product Image (optional)
            <input
              className='admin-product-form__input'
              type='file'
              accept='image/*'
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </label>

          {formError && <p role='alert'>{formError}</p>}

          {successMessage && <p role='status'>{successMessage}</p>}

          <button
            className='admin-product-form__submit'
            type='submit'
            disabled={submitting || !token}
          >
            {submitting
              ? editingProduct
                ? 'Updating...'
                : 'Creating...'
              : editingProduct
                ? 'Update Product'
                : 'Create Product'}
          </button>
        </form>
      </section>

      <p>Total products: {products.length}</p>
      <p>Total categories: {categories.length}</p>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        products.map((product) => (
          <article key={product._id}>
            <h3>{product.name}</h3>
            <button type='button' onClick={() => handleEdit(product)}>
              Edit
            </button>

            <button
              type='button'
              onClick={() => handleDelete(product)}
              disabled={deletingProductId === product._id}
            >
              {deletingProductId === product._id ? 'Deleting...' : 'Delete'}
            </button>

            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} width='120' />
            )}

            <p>Price: R{product.price.toFixed(2)}</p>
            <p>Category: {getCategoryName(product)}</p>
            <p>Stock: {product.stock}</p>
            <p>Reserved stock: {product.reservedStock}</p>
            <p>{product.description}</p>
          </article>
        ))
      )}
    </main>
  )
}

export default AdminProductsPage
