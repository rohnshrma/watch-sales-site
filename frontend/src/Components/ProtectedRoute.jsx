// React hook reads auth context state.
import { useContext } from "react";
// Navigate handles redirect behavior for blocked routes.
import { Navigate, useLocation } from "react-router-dom";
// Auth state source.
import AuthContext from "../context/AuthContext";

// Route guard requiring login and optionally admin role.
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useContext(AuthContext);
  const location = useLocation();

  // Wait until local auth session restore finishes.
  if (isLoading) {
    return (
      <div className="lux-shell lux-page">
        <div className="lux-loader-wrap">
          <div className="lux-spinner" role="status"></div>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login page.
  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace state={{ from: location }} />;
  }

  // Block non-admin users when admin route is requested.
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render protected route contents.
  return children;
};

// Export guard component for route tree usage.
export default ProtectedRoute;
