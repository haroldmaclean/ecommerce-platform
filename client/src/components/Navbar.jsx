import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Menu, X } from 'lucide-react'

function Navbar() {
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)

  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <nav className='navbar'>
      <h2 className='navbar__brand'>Our Store</h2>

      <button
        className='navbar__toggle'
        type='button'
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls='navbar-links'
        onClick={() => setMenuOpen((previous) => !previous)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul
        id='navbar-links'
        className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}
      >
        <li>
          <NavLink
            to='/'
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to='/products'
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Products
          </NavLink>
        </li>

        <li>
          <NavLink
            to='/cart'
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Cart
          </NavLink>
        </li>

        {token && (
          <>
            <li>
              <NavLink
                to='/checkout'
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                Checkout
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/orders'
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                My Orders
              </NavLink>
            </li>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <li>
              <NavLink
                to='/admin/orders'
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                Admin Orders
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/admin/products'
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                Admin Products
              </NavLink>
            </li>
          </>
        )}

        {!token ? (
          <>
            <li>
              <NavLink
                to='/login'
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                Login
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/register'
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                Register
              </NavLink>
            </li>
          </>
        ) : (
          <li>
            <NavLink
              to='/logout'
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeMenu}
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
