import { createSlice } from '@reduxjs/toolkit'

const savedCart = localStorage.getItem('cart')

const initialState = {
  items: savedCart ? JSON.parse(savedCart) : [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action) {
      state.items = action.payload
    },

    addItem(state, action) {
      const product = action.payload

      const existingItem = state.items.find(
        (item) => item.product._id === product._id,
      )

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          product,
          quantity: 1,
        })
      }
    },

    updateQuantity(state, action) {
      const { productId, quantity } = action.payload

      const existingItem = state.items.find(
        (item) => item.product._id === productId,
      )

      if (existingItem) {
        existingItem.quantity = quantity
      }
    },

    removeItem(state, action) {
      const productId = action.payload

      state.items = state.items.filter((item) => item.product._id !== productId)
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { setCart, addItem, updateQuantity, removeItem, clearCart } =
  cartSlice.actions

export default cartSlice.reducer
