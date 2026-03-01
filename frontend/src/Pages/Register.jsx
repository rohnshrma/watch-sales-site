import React, { useReducer } from "react";

const initialState = {
  name: "",
  email: "",
  password: "",
};

const registerReducer = (state, action) => {
  if (
    action.type === "NAME" ||
    action.type === "EMAIL" ||
    action.type === "PASSWORD"
  ) {
    return {
      ...state,
      [action.type]: action.payload,
    };
  } else {
    return state;
  }
};

const Register = () => {
  const [state, dispatch] = useReducer(registerReducer, initialState);

  const changeHandler = (e) => {
    return dispatch({ type: e.target.name, payload: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };
  return (
    <div className="register container mt-5 ">
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            name="name"
            placeholder="Enter full name"
            onChange={changeHandler}
          />
        </div>
        <div className="form-group">
          <input
            className="form-control"
            type="email"
            name="email"
            placeholder="Enter email address"
            onChange={changeHandler}
          />
        </div>
        <div className="form-group">
          <input
            className="form-control"
            type="password"
            name="password"
            placeholder="Enter password"
            onChange={changeHandler}
          />
        </div>
        <button className="btn btn-success">REGISTER</button>
      </form>
    </div>
  );
};

export default Register;
