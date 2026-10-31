import { useState } from "react";
import "./ProductSection.css";

import cloth1 from "../../assets/cloth1.png";
import cloth2 from "../../assets/cloth2.png";
import cloth3 from "../../assets/cloth3.png";
import cloth4 from "../../assets/cloth4.png";

import ProductCard from "../ProductCard/ProductCard";

const newArrivals = [
  {
    id: 1,
    name: "T-shirt with Tape Details",
    price: 120,
    rating: 4.5,
    image: cloth1,
  },

  {
    id: 2,
    name: "Skinny Fit Jeans",
    price: 240,
    oldPrice: 260,
    discount: 20,
    rating: 3.5,
    image: cloth2,
  },

  {
    id: 3,
    name: "Checkered Shirt",
    price: 180,
    rating: 4.5,
    image: cloth3,
  },

  {
    id: 4,
    name: "Sleeve Striped T-shirt",
    price: 130,
    oldPrice: 160,
    discount: 30,
    rating: 4.5,
    image: cloth4,
  },
];

const ProductSection = () => {
  const [showAll, setShowAll] = useState(false);

  // View All click hone par 4 products TEEN baar jod kar 12 (4+4+4) ban jate hain
  const displayedProducts = showAll
    ? [...newArrivals, ...newArrivals, ...newArrivals]
    : newArrivals;

  return (
    <section className="product-section">

      {/* Heading */}
      <h2 className="section-title">
        NEW ARRIVALS
      </h2>

      {/* Products */}
      <div className="products-grid">

        {displayedProducts.map((product, index) => (
          <ProductCard
            key={`${product.id}-${index}`}
            product={product}
          />
        ))}

      </div>

      {/* View All */}
      {!showAll && (
        <button className="view-all-btn" onClick={() => setShowAll(true)}>
          View All
        </button>
      )}

    </section>
  );
};

export default ProductSection;