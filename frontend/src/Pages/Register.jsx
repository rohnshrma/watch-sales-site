// React hooks manage local form object and async request status.
import React, { useContext, useState } from "react";
// Link + navigate for auth flow routing.
import { Link, useNavigate } from "react-router-dom";
// Auth context provides register action.
import AuthContext from "../context/AuthContext";

// Registration page component.
const Register = () => {
  // Form model for registration payload.
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  // Error message state.
  const [error, setError] = useState("");
  // Pending-submit state.
  const [loading, setLoading] = useState(false);
  // Register action from auth context.
  const { register } = useContext(AuthContext);
  // Navigation helper.
  const navigate = useNavigate();

  // Generic input change handler.
  const changeHandler = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  // Submit registration and redirect home on success.
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lux-shell lux-page">
      <section className="lux-auth-card">
        <h2 className="lux-title">Register</h2>
        {error ? <div className="lux-alert lux-alert-danger">{error}</div> : null}
        <form onSubmit={submitHandler} className="lux-form-grid">
          <input
            className="lux-input"
            type="text"
            name="name"
            placeholder="Full name"
            onChange={changeHandler}
            value={form.name}
            required
          />
          <input
            className="lux-input"
            type="email"
            name="email"
            placeholder="Email address"
            onChange={changeHandler}
            value={form.email}
            required
          />
          <input
            className="lux-input"
            type="password"
            name="password"
            placeholder="Password"
            onChange={changeHandler}
            value={form.password}
            required
          />
          <button className="lux-btn lux-btn-primary lux-btn-block" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="lux-muted" style={{ marginTop: "1rem" }}>
          Already have an account? <Link className="lux-inline-link" to="/user/login">Login</Link>
        </p>
      </section>
    </div>
  );
};

// Export page for route usage.
export default Register;
