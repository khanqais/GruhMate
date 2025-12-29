import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchBar } from '../components/SearchBar';
import { ProductGrid } from '../components/ProductGrid';
import { LoadingState } from '../components/LoadingState';
import { searchTechProducts } from '../api';
import './CategoryPage.css';

export function TechPage() {
  const navigate = useNavigate();
  const [amazonProducts, setAmazonProducts] = useState([]);
  const [flipkartProducts, setFlipkartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState('');

  const handleSearch = async (product, location) => {
    setIsLoading(true);
    setError(null);
    setLastSearch(product);

    try {
      const data = await searchTechProducts({ product, location });
      setAmazonProducts(data.amazon);
      setFlipkartProducts(data.flipkart);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setAmazonProducts([]);
      setFlipkartProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalProducts = amazonProducts.length + flipkartProducts.length;

  return (
    <div className="category-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/compare')}>
          ← Back to Home
        </button>
        <div className="header-content">
          <h1>📱 Tech & Home Products</h1>
          <p>Compare prices across Amazon & Flipkart</p>
        </div>
      </header>

      <main className="page-main">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} category="tech" />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {isLoading && <LoadingState category="tech" />}

        {!isLoading && hasSearched && (
          <>
            <div className="results-summary">
              <h2>
                Results for "<span className="search-term">{lastSearch}</span>"
              </h2>
              <p>{totalProducts} products found across 2 stores</p>
            </div>

            <div className="comparison-container">
              <ProductGrid
                title="Amazon"
                products={amazonProducts}
                icon="📦"
                accentColor="#ff9900"
              />
              <ProductGrid
                title="Flipkart"
                products={flipkartProducts}
                icon="🏪"
                accentColor="#2962ff"
              />
            </div>
          </>
        )}

        {!isLoading && !hasSearched && (
          <div className="welcome-state">
            <div className="welcome-content">
              <div className="welcome-icon">📱</div>
              <h2>Search for Tech & Home Products</h2>
              <p>Enter a product name to compare prices from Amazon and Flipkart</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
