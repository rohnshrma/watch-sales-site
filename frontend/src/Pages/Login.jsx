import { useContext, useReducer, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const initialState = {
  email: "",
  password: "",
};

const loginReducer = (state, action) => {
  if (action.type === "email" || action.type === "password") {
    return {
      ...state,
      [action.type]: action.payload,
    };
  }
  return state;
};

const Login = () => {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const changeHandler = (e) => {
    dispatch({ type: e.target.name, payload: e.target.value });
    if (error) setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(state);
      const redirectPath =
        location.state?.from?.pathname ||
        (res.data.role === "admin" ? "/admin/dashboard" : "/");
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-shell--narrow">
      <div className="auth-shell">
        <div className="page-header page-header--compact">
          <p className="page-eyebrow">Account</p>
          <h2>Welcome back</h2>
          <p className="page-subtext">Sign in to manage your orders, cart, and profile.</p>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={submitHandler} className="form-stack">
          <div className="form-group">
            <input
              className="form-control app-input"
              type="email"
              name="email"
              placeholder="Enter email address"
              onChange={changeHandler}
              value={state.email}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="form-control app-input"
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={changeHandler}
              value={state.password}
              required
            />
          </div>
          <button className="btn app-btn app-btn--primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-shell__footer">
          New user? <Link to="/user/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
