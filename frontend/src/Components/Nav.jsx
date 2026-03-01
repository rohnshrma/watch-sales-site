import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import CartContext from "../context/CartContext";

const Nav = () => {
  const { isAuthenticated, isAdmin, user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <strong>⌚ Watch Store</strong>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                🏠 Home
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    🛒 Cart ({cartItems.length})
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">
                    📦 Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    👤 {user?.name?.split(" ")[0] || "Profile"}
                  </Link>
                </li>
                {isAdmin ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/add-product">
                        ➕ Add Product
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">
                        👨🏻‍💼 ADMIN
                      </Link>
                    </li>
                  </>
                ) : null}
                <li className="nav-item">
                  <button className="btn btn-sm btn-danger ml-2" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/login">
                    🔐 Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user/register">
                    📝 Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
