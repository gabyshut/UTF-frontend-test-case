import React, { useState, useEffect, useMemo } from 'react'
import { Provider, useSelector, useDispatch } from 'react-redux'

/*
  Импортируем action creators, а не используем ручные dispatch с type
  Это защищает от опечаток и привязки к строковым типам экшенов
*/
import {
  store,
  setProducts,
  setUser,
  setLoading,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartCount,
  selectTotalPrice
} from './store/store'

import './App.css'

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <Header />
        <div className="main-content">
          <ProductList />
          <Cart />
        </div>
      </div>
    </Provider>
  )
}

function ProductList() {
  const dispatch = useDispatch()

  /*
    Используем useSelector только для чтения данных
    Компонент не знает, как они считаются
  */
  const products = useSelector((state) => state.app.products)
  const loading = useSelector((state) => state.app.loading)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    /*
      Управление loading вынесено в Redux
      Компонент не хранит "isLoading" локально
    */
    dispatch(setLoading(true))

    const timer = setTimeout(() => {
      const mockProducts = [
        { id: 1, name: 'iPhone 14', price: 799, category: 'phones', image: 'https://via.placeholder.com/200', description: 'Новейший iPhone' },
        { id: 2, name: 'Samsung Galaxy S23', price: 699, category: 'phones', image: 'https://via.placeholder.com/200', description: 'Флагман Samsung' },
        { id: 3, name: 'MacBook Pro', price: 1999, category: 'laptops', image: 'https://via.placeholder.com/200', description: 'Мощный ноутбук Apple' },
        { id: 4, name: 'Dell XPS 13', price: 1299, category: 'laptops', image: 'https://via.placeholder.com/200', description: 'Премиум ноутбук Dell' },
        { id: 5, name: 'iPad Air', price: 599, category: 'tablets', image: 'https://via.placeholder.com/200', description: 'Планшет Apple' },
        { id: 6, name: 'Samsung Galaxy Tab', price: 399, category: 'tablets', image: 'https://via.placeholder.com/200', description: 'Планшет Samsung' }
      ]

      dispatch(setProducts(mockProducts))
      dispatch(setLoading(false))
    }, 1000)

    /*
      Чистим таймер при размонтировании
      Защита от setState на размонтированном компоненте
    */
    return () => clearTimeout(timer)
  }, [dispatch])

  /*
    Фильтрация и сортировка вынесены в useMemo
    Не пересчитываются на каждом рендере
  */
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'price') return a.price - b.price
        return 0
      })
  }, [products, searchTerm, selectedCategory, sortBy])

  if (loading) {
    return <div className="loading">Загрузка товаров...</div>
  }

  return (
    <div className="product-list">
      <div className="filters">
        <div className="search">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            <option value="phones">Телефоны</option>
            <option value="laptops">Ноутбуки</option>
            <option value="tablets">Планшеты</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">По названию</option>
            <option value="price">По цене</option>
          </select>

          <button onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>
      </div>

      <div className="products">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="price">${product.price}</div>

            {/*
              Используем addToCart action creator
              Убраны "магические строки" type
            */}
            <button onClick={() => dispatch(addToCart(product))}>
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Cart() {
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.app.cart)

  /*
    cartCount и totalPrice больше НЕ хранятся в store
    Это вычисляемые данные, получаем через селекторы
  */
  const cartCount = useSelector(selectCartCount)
  const totalPrice = useSelector(selectTotalPrice)

  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(id)
      return
    }

    dispatch(updateQuantity({ id, quantity }))
  }

  const handleCheckout = () => {
    setShowCheckout(true)

    setTimeout(() => {
      alert('Заказ оформлен!')
      dispatch(clearCart())
      setShowCheckout(false)
      setIsOpen(false)
    }, 1000)
  }

  return (
    <div className="cart">
      <button
        className="cart-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Корзина ({cartCount})
      </button>

      {isOpen && (
        <div className="cart-dropdown">
          <div className="cart-header">
            <h3>Корзина</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <p>Корзина пуста</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="total">Итого: ${totalPrice}</div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={cart.length === 0 || showCheckout}
            >
              {showCheckout ? 'Оформляем...' : 'Оформить заказ'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Header() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.app.user)

  useEffect(() => {
    /*
      Эффект изолирован
      Нет лишней логики в JSX
    */
    const timer = setTimeout(() => {
      dispatch(setUser({
        id: 1,
        name: 'Иван Иванов',
        email: 'ivan@example.com'
      }))
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch])

  return (
    <header className="header">
      <h1>🛒 Интернет-магазин</h1>
      <div className="user-info">
        {user ? (
          <span>Привет, {user.name}!</span>
        ) : (
          <span>Загрузка...</span>
        )}
      </div>
    </header>
  )
}

export default App
