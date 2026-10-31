import { useState } from "react";
import "./ProductDetails.css";
import { Link, useLocation } from "react-router-dom";
import Reviews from "../../Components/Reviews/Reviews";
import ProductRecommendations from "../../Components/ProductRecommendations/ProductRecommendations";
import cloth1 from "../../assets/cloth1.png";

import { useCart } from "../../Context/Cart";

const ProductDetails = () => {
  const location = useLocation();

  const product = location.state || {
    id: 1,
    name: "One Life Graphic T-shirt",
    price: 260,
    oldPrice: 300,
    discount: 40,
    rating: 4.5,
    image: cloth1,
  };

  const [selectedColor, setSelectedColor] = useState("brown");
  const [selectedSize, setSelectedSize] = useState("Large");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.image);

  const { addToCart } = useCart();

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  };

  return (
    <main className="product-details-page">
      {/* Breadcrumb */}
      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/category">Shop</Link>
        <span>/</span>
        <Link to="/category?category=men">Men</Link>
        <span>/</span>
        <strong>{product.name}</strong>
      </div>

      {/* ================= PRODUCT MAIN ================= */}
      <section className="product-main">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="thumbnail-list">
            {[product.image, product.image, product.image].map((img, index) => (
              <button
                key={index}
                type="button"
                className={`thumbnail ${mainImage === img && index === 0 ? "active" : ""}`}
                onClick={() => setMainImage(img)}
              >
                <img src={img} alt={product.name} />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="main-product-image">
            <img src={mainImage} alt={product.name} />
          </div>
        </div>

        {/* ================= PRODUCT INFO ================= */}
        <div className="product-info">
          <h1>{product.name.toUpperCase()}</h1>

          {/* Rating */}
          <div className="rating-row">
            <span className="stars">★★★★★</span>
            <span className="rating-number">{product.rating}/5</span>
          </div>

          {/* Price */}
          <div className="price-row">
            <span className="product-price">${product.price}</span>

            {product.oldPrice && (
              <>
                <span className="old-price">${product.oldPrice}</span>
                <span className="discount">-{product.discount}%</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="product-description">
            This graphic t-shirt which is perfect for any occasion.
            Crafted from a soft and breathable fabric, it offers
            exceptional comfort and style.
          </p>

          <div className="product-line"></div>

          {/* ================= COLORS ================= */}
          <div className="option-section">
            <p className="option-title">Select Colors</p>

            <div className="color-options">
              <button
                type="button"
                aria-label="Brown"
                className={`color color-brown ${selectedColor === "brown" ? "selected" : ""}`}
                onClick={() => setSelectedColor("brown")}
              >
                {selectedColor === "brown" && "✓"}
              </button>

              <button
                type="button"
                aria-label="Green"
                className={`color color-green ${selectedColor === "green" ? "selected" : ""}`}
                onClick={() => setSelectedColor("green")}
              >
                {selectedColor === "green" && "✓"}
              </button>

              <button
                type="button"
                aria-label="Navy"
                className={`color color-navy ${selectedColor === "navy" ? "selected" : ""}`}
                onClick={() => setSelectedColor("navy")}
              >
                {selectedColor === "navy" && "✓"}
              </button>
            </div>
          </div>

          <div className="product-line"></div>

          {/* ================= SIZE ================= */}
          <div className="option-section">
            <p className="option-title">Choose Size</p>

            <div className="size-options">
              {["Small", "Medium", "Large", "X-Large"].map((size) => (
                <button
                  type="button"
                  key={size}
                  className={selectedSize === size ? "selected-size" : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-line"></div>

          {/* ================= QUANTITY + CART ================= */}
          <div className="purchase-row">
            <div className="quantity-box">
              <button type="button" onClick={decreaseQuantity}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={increaseQuantity}>+</button>
            </div>

            <button type="button" className="add-cart-button" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS / DETAILS / FAQ ================= */}
      <Reviews />
      <ProductRecommendations />
    </main>
  );
};

export default ProductDetails;