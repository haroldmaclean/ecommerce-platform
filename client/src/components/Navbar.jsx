import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <h2>Our Store</h2>

      <ul>
        <li>Home</li>
        <li>
          <NavLink
            to='/products'
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Products
          </NavLink>
        </li>

        <li>Cart</li>
      </ul>
    </nav>
  )
}

export default Navbar
