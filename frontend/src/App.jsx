import React from "react";
import { Routes, Route } from "react-router-dom";
import AddProduct from "./Pages/AddProduct";
import Nav from "./Components/Nav";
import Home from "./Pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  return (
    <>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-product" element={<AddProduct />} />
      </Routes>

      {/* <Footer /> */}
    </>
  );
};

export default App;
