// React hooks manage reducer form state, lifecycle fetch, and status flags.
import { useContext, useEffect, useReducer, useState } from "react";
// Auth context provides profile data + profile actions.
import AuthContext from "../context/AuthContext";

// Initial profile edit form values.
const initialState = {
  name: "",
  email: "",
  password: "",
};

// Reducer handles profile load and field updates.
const profileReducer = (state, action) => {
  if (action.type === "LOAD") {
    return {
      ...state,
      name: action.payload.name || "",
      email: action.payload.email || "",
      password: "",
    };
  }

  if (action.type === "name" || action.type === "email" || action.type === "password") {
    return {
      ...state,
      [action.type]: action.payload,
    };
  }

  return state;
};

// Profile page component.
const Profile = () => {
  // Reducer state for editable profile fields.
  const [state, dispatch] = useReducer(profileReducer, initialState);
  // Error feedback message.
  const [error, setError] = useState("");
  // Success feedback message.
  const [success, setSuccess] = useState("");
  // Pending-submit state.
  const [loading, setLoading] = useState(false);
  // Auth context values/actions.
  const { user, fetchProfile, updateProfile } = useContext(AuthContext);

  // Load current profile into local form on page mount.
  useEffect(() => {
    if (user) {
      dispatch({ type: "LOAD", payload: user });
    } else {
      fetchProfile()
        .then((data) => {
          dispatch({ type: "LOAD", payload: data });
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Failed to load profile");
        });
    }
  }, []);

  // Generic input change handler.
  const changeHandler = (e) => {
    dispatch({ type: e.target.name, payload: e.target.value });
  };

  // Submit profile updates.
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload = {
        name: state.name,
        email: state.email,
      };

      if (state.password.trim()) {
        payload.password = state.password.trim();
      }

      await updateProfile(payload);
      setSuccess("Profile updated successfully");
      dispatch({ type: "password", payload: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lux-shell lux-page">
      <section className="lux-auth-card">
        <h2 className="lux-title">My Profile</h2>
        {error ? <div className="lux-alert lux-alert-danger">{error}</div> : null}
        {success ? <div className="lux-alert lux-alert-success">{success}</div> : null}
        <form onSubmit={submitHandler} className="lux-form-grid">
          <input
            className="lux-input"
            type="text"
            name="name"
            placeholder="Full name"
            onChange={changeHandler}
            value={state.name}
            required
          />
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
            placeholder="New password (optional)"
            onChange={changeHandler}
            value={state.password}
          />
          <button className="lux-btn lux-btn-primary lux-btn-block" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </section>
    </div>
  );
};

// Export page for route usage.
export default Profile;
