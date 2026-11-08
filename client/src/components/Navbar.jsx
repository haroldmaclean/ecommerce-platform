import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Navbar() {
  const token = useSelector((state) => state.auth.token)

  return (
    <nav>
      <h2>Our Store</h2>

      <ul>
        <li>
          <NavLink
            to='/'
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to='/products'
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Products
          </NavLink>
        </li>

        <li>
          <NavLink
            to='/cart'
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Cart
          </NavLink>
        </li>

        {token && (
          <li>
            <NavLink
              to='/checkout'
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Checkout
            </NavLink>
          </li>
        )}

        {token && (
          <li>
            <NavLink
              to='/orders'
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              My Orders
            </NavLink>
          </li>
        )}

        {!token ? (
          <li>
            <NavLink
              to='/login'
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Login
            </NavLink>
          </li>
        ) : (
          <li>
            <NavLink
              to='/logout'
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Logout
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Navbar
