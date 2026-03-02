// React hooks manage reducer form state and UI status messages.
import { useContext, useReducer, useState } from "react";
// Routing helpers for links and post-login redirects.
import { Link, useLocation, useNavigate } from "react-router-dom";
// Auth context provides login action.
import AuthContext from "../context/AuthContext";

// Initial login form values.
const initialState = {
  email: "",
  password: "",
};

// Reducer updates one field at a time.
const loginReducer = (state, action) => {
  if (action.type === "email" || action.type === "password") {
    return {
      ...state,
      [action.type]: action.payload,
    };
  }
  return state;
};

// Login page component.
const Login = () => {
  // Form reducer state.
  const [state, dispatch] = useReducer(loginReducer, initialState);
  // Error message state.
  const [error, setError] = useState("");
  // Pending-submit state.
  const [loading, setLoading] = useState(false);
  // Login action from auth context.
  const { login } = useContext(AuthContext);
  // Navigation helper.
  const navigate = useNavigate();
  // Holds prior route user attempted to access.
  const location = useLocation();

  // Generic input change handler.
  const changeHandler = (e) => {
    dispatch({ type: e.target.name, payload: e.target.value });
    if (error) setError("");
  };

  // Submit login request and redirect after success.
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(state);
      const redirectPath = location.state?.from?.pathname || "/";
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lux-shell lux-page">
      <section className="lux-auth-card">
        <h2 className="lux-title">Login</h2>
        {error ? <div className="lux-alert lux-alert-danger">{error}</div> : null}
        <form onSubmit={submitHandler} className="lux-form-grid">
          <input
            className="lux-input"
            type="email"
            name="email"
            placeholder="Email address"
            onChange={changeHandler}
            value={state.email}
            required
          />
          <input
            className="lux-input"
            type="password"
            name="password"
            placeholder="Password"
            onChange={changeHandler}
            value={state.password}
            required
          />
          <button className="lux-btn lux-btn-primary lux-btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="lux-muted" style={{ marginTop: "1rem" }}>
          New user? <Link className="lux-inline-link" to="/user/register">Create account</Link>
        </p>
      </section>
    </div>
  );
};

// Export page for route usage.
export default Login;
