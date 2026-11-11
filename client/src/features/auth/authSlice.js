import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: null,
  user: null,
  initialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload
    },
    setUser(state, action) {
      state.user = action.payload
    },
    clearToken(state) {
      state.token = null
      state.user = null
    },
    setAuthInitialized(state) {
      state.initialized = true
    },
  },
})

export const { setToken, setUser, clearToken, setAuthInitialized } =
  authSlice.actions

export default authSlice.reducer
