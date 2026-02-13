import React, { useContext, useEffect } from "react";
import ProductContext from "../../context/ProductContext";
import ProductCard from "../../Components/ProductCard";

const ManageProducts = () => {
  const { products } = useContext(ProductContext);

  console.log(products);
  return (
    <div>
      {products.map((product) => (
        <ProductCard product={product} />
      ))}
    </div>
  );
};

export default ManageProducts;
