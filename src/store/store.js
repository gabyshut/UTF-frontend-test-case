import { configureStore, createSlice, createSelector } from '@reduxjs/toolkit'

/*
  Убраны все вычисляемые поля из initialState
  В store храним только источник истины
*/
const initialState = {
  products: [],
  cart: [],
  user: null,
  loading: false,
  error: null
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload
    },

    addToCart: (state, action) => {
      const product = action.payload
      const existingItem = state.cart.find(item => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cart.push({ ...product, quantity: 1 })
      }
    },

    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item.id !== action.payload)
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.cart.find(item => item.id === id)

      if (item) {
        item.quantity = quantity
      }
    },

    clearCart: (state) => {
      state.cart = []
    },

    setUser: (state, action) => {
      state.user = action.payload
    },

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
    }
  }
})

/* 
   СЕЛЕКТОРЫ
    */

export const selectProducts = state => state.app.products
export const selectCart = state => state.app.cart
export const selectUser = state => state.app.user
export const selectLoading = state => state.app.loading

/*
  Производные данные считаются через createSelector
  Нет дублирования
  Есть мемоизация
*/
export const selectCartCount = createSelector(
  [selectCart],
  cart => cart.reduce((sum, item) => sum + item.quantity, 0)
)

export const selectTotalPrice = createSelector(
  [selectCart],
  cart => cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export const {
  setProducts,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setUser,
  setLoading,
  setError
} = appSlice.actions

export const store = configureStore({
  reducer: {
    app: appSlice.reducer
  }
})
