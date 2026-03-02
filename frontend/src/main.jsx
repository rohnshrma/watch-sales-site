// React StrictMode helps highlight potential lifecycle and side-effect issues in development.
import { StrictMode } from "react";
// createRoot is the React 18+ API used to mount the app into the DOM.
import { createRoot } from "react-dom/client";
// Root application component that contains routing and shared layout.
import App from "./App.jsx";
// BrowserRouter enables client-side routing with clean URLs.
import { BrowserRouter as Router } from "react-router-dom";
// ProductProvider exposes product CRUD state/actions to descendant components.
import { ProductProvider } from "./context/ProductContext.jsx";
// CartProvider exposes cart state/actions to descendant components.
import { CartProvider } from "./context/CartContext.jsx";

// Mount the React app into the #root element defined in index.html.
createRoot(document.getElementById("root")).render(
  // StrictMode wraps the full app for additional runtime checks in development.
  <StrictMode>
    {/* Router provides navigation and route matching context. */}
    <Router>
      {/* ProductProvider shares product data and API actions globally. */}
      <ProductProvider>
        {/* CartProvider shares cart data and API actions globally. */}
        <CartProvider>
          {/* App contains the visual shell and page routes. */}
          <App />
        </CartProvider>
      </ProductProvider>
    </Router>
  </StrictMode>
);
