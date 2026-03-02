// React hooks are used for context consumption and menu toggle state.
import React, { useContext, useState } from "react";
// Link/NavLink provide navigation and active-link styling support.
import { Link, NavLink } from "react-router-dom";
// CartContext provides current cart item count for navbar display.
import CartContext from "../context/CartContext";
// AuthContext provides auth-aware navbar actions.
import AuthContext from "../context/AuthContext";

// Helper returns base nav class and appends active class when route matches.
const navLinkClass = ({ isActive }) =>
  `lux-nav-link${isActive ? " active-nav-link" : ""}`;

// Top navigation component for storefront + management + auth routes.
const Nav = () => {
  // Read cart items to show live count in the Cart nav label.
  const { cartItems } = useContext(CartContext);
  // Read auth state for conditional links and logout action.
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  // Mobile menu open/close state.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Utility closes menu after user clicks a nav item.
  const closeMenu = () => setIsMenuOpen(false);

  // Logout click handler.
  const handleLogout = () => {
    closeMenu();
    logout();
  };

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

            {isAuthenticated ? (
              <>
                <li>
                  <NavLink className={navLinkClass} to="/cart" onClick={closeMenu}>
                    Cart ({cartItems.length})
                  </NavLink>
                </li>
                <li>
                  <NavLink className={navLinkClass} to="/profile" onClick={closeMenu}>
                    {user?.name?.split(" ")[0] || "Profile"}
                  </NavLink>
                </li>
                <li>
                  <button className="lux-btn lux-btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink className={navLinkClass} to="/user/login" onClick={closeMenu}>
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink className={navLinkClass} to="/user/register" onClick={closeMenu}>
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Export so App can render the shared navigation.
export default Nav;
