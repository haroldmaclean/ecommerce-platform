import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartLoadFailed(state, action) {
      state.status = 'failed'
      state.error = action.payload
    },
    cartLoadStarted(state) {
      state.status = 'loading'
      state.error = null
    },
    setCart(state, action) {
      state.items = action.payload
      state.status = 'succeeded'
      state.error = null
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

export const {
  cartLoadStarted,
  cartLoadFailed,
  setCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
