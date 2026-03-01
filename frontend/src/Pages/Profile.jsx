import { useContext, useEffect, useReducer, useState } from "react";
import AuthContext from "../context/AuthContext";

const initialState = {
  name: "",
  email: "",
  password: "",
};

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

const Profile = () => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, fetchProfile, updateProfile } = useContext(AuthContext);

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

  const changeHandler = (e) => {
    dispatch({ type: e.target.name, payload: e.target.value });
  };

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
    <div className="register container mt-5">
      <h2 className="mb-4">My Profile</h2>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="name"
            placeholder="Enter full name"
            onChange={changeHandler}
            value={state.name}
            required
          />
        </div>
        <div className="form-group">
          <input
            className="form-control"
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
            className="form-control"
            type="password"
            name="password"
            placeholder="Enter new password (optional)"
            onChange={changeHandler}
            value={state.password}
          />
        </div>
        <button className="btn btn-success" disabled={loading}>
          {loading ? "Updating..." : "UPDATE PROFILE"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
