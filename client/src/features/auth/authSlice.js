import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: null,
  initialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload
    },
    clearToken(state) {
      state.token = null
    },
    setAuthInitialized(state) {
      state.initialized = true
    },
  },
})

export const { setToken, clearToken, setAuthInitialized } = authSlice.actions

export default authSlice.reducer
