import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const changeHandler = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

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
    <div className="page-shell page-shell--narrow">
      <div className="auth-shell">
        <div className="page-header page-header--compact">
          <p className="page-eyebrow">Account</p>
          <h2>Create your account</h2>
          <p className="page-subtext">Set up your account to start shopping and tracking orders.</p>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form onSubmit={submitHandler} className="form-stack">
          <div className="form-group">
            <input
              className="form-control app-input"
              type="text"
              name="name"
              placeholder="Enter full name"
              onChange={changeHandler}
              value={form.name}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="form-control app-input"
              type="email"
              name="email"
              placeholder="Enter email address"
              onChange={changeHandler}
              value={form.email}
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
              value={form.password}
              required
            />
          </div>
          <button className="btn app-btn app-btn--primary" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="auth-shell__footer">
          Already have an account? <Link to="/user/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
