import { configureStore } from '@reduxjs/toolkit'

import counterReducer from '../features/counter/counterSlice'

import cartReducer from '../features/cart/cartSlice'

import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: { counter: counterReducer, cart: cartReducer, auth: authReducer },
})
