import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ProductGrid } from '../components/ProductGrid';
import { LoadingState } from '../components/LoadingState';
import { searchGroceryProducts } from '../api';
import './CategoryPage.css';

export default function GroceryPage() {
  const navigate = useNavigate();
  const [zeptoProducts, setZeptoProducts] = useState([]);
  const [jiomartProducts, setJiomartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState('');

  const handleSearch = async (product, location) => {
    setIsLoading(true);
    setError(null);
    setLastSearch(product);

    try {
      const data = await searchGroceryProducts({ product, location });
      setZeptoProducts(data.zepto);
      setJiomartProducts(data.jiomart);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setZeptoProducts([]);
      setJiomartProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalProducts = zeptoProducts.length + jiomartProducts.length;

  return (
    <div className="category-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/compare')}>
          ← Back to Home
        </button>
        <div className="header-content">
          <h1>🛒 Grocery Comparison</h1>
          <p>Compare prices across Zepto & JioMart instantly</p>
        </div>
      </header>

      <main className="page-main">
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          category="grocery"
        />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {isLoading && <LoadingState category="grocery" />}

        {!isLoading && hasSearched && (
          <>
            <div className="results-summary">
              <h2>
                Results for "
                <span className="search-term">{lastSearch}</span>"
              </h2>
              <p>{totalProducts} products found across 2 stores</p>
            </div>

            <div className="comparison-container">
              <ProductGrid
                title="Zepto"
                products={zeptoProducts}
                icon="⚡"
                accentColor="#8a2be2"
                showPriceHistory={false}
              />
              <ProductGrid
                title="JioMart"
                products={jiomartProducts}
                icon="🛍️"
                accentColor="#0078ad"
                showPriceHistory={false}
              />
            </div>
          </>
        )}

        {!isLoading && !hasSearched && (
          <div className="welcome-state">
            <div className="welcome-content">
              <div className="welcome-icon">🛒</div>
              <h2>Search for Grocery Items</h2>
              <p>
                Enter a product name to compare prices from Zepto and JioMart
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
