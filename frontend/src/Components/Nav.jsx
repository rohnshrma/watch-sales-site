// React hooks are used for context consumption and menu toggle state.
import React, { useContext, useState } from "react";
// Link/NavLink provide navigation and active-link styling support.
import { Link, NavLink } from "react-router-dom";
// CartContext provides current cart item count for navbar display.
import CartContext from "../context/CartContext";

// Helper returns base nav class and appends active class when route matches.
const navLinkClass = ({ isActive }) =>
  `lux-nav-link${isActive ? " active-nav-link" : ""}`;

// Top navigation component for storefront + management routes.
const Nav = () => {
  // Read cart items to show live count in the Cart nav label.
  const { cartItems } = useContext(CartContext);
  // Mobile menu open/close state.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Utility closes menu after user clicks a nav item.
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="lux-nav">
      <div className="lux-shell lux-nav-inner">
        {/* Brand logo/title linking back to home page. */}
        <Link className="lux-brand" to="/" onClick={closeMenu}>
          <strong>Watch Eclat</strong>
        </Link>

        {/* Hamburger toggle for mobile navigation. */}
        <button
          className="lux-nav-toggle"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-controls="luxNavMenu"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>

        {/* Menu panel; adds `show` class when open on smaller screens. */}
        <div className={`lux-nav-menu${isMenuOpen ? " show" : ""}`} id="luxNavMenu">
          <ul className="lux-nav-list">
            <li>
              <NavLink className={navLinkClass} to="/" onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink className={navLinkClass} to="/manage-products" onClick={closeMenu}>
                Manage Products
              </NavLink>
            </li>
            <li>
              <NavLink className={navLinkClass} to="/add-product" onClick={closeMenu}>
                Add Product
              </NavLink>
            </li>
            <li>
              <NavLink className={navLinkClass} to="/cart" onClick={closeMenu}>
                Cart ({cartItems.length})
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Export so App can render the shared navigation.
export default Nav;
