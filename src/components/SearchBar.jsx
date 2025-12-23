import { useState } from 'react';

import './SearchBar.css';



export function SearchBar({ onSearch, isLoading, category }) {
  const [product, setProduct] = useState('');
  const [location, setLocation] = useState('Mumbai');

  const placeholders = {
    grocery: 'e.g., bread, milk, eggs...',
    tech: 'e.g., iPhone, laptop, headphones.'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.trim()) {
      onSearch(product.trim(), location.trim());
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-inputs">
        <div className="input-group">
          <label htmlFor="product">Search Product</label>
          <input
            id="product"
            type="text"
            placeholder={placeholders[category]}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            placeholder="e.g., Mumbai, Delhi..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !product.trim()}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              Compare Prices
            </>
          )}
        </button>
      </div>
    </form>
  );
}
