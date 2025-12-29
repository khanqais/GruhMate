const API_BASE_URL = import.meta.env.VITE_API_URL;


export async function searchGroceryProducts(request) {
  const response = await fetch(`${API_BASE_URL}/search-grocery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product: request.product,
      location: request.location || 'Mumbai',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to fetch products');
  }

  return response.json();
}

export async function searchTechProducts(request) {
  const response = await fetch(`${API_BASE_URL}/search-tech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product: request.product,
      location: request.location || 'Mumbai',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to fetch products');
  }

  return response.json();
}

export async function trackPrice(request) {
  const response = await fetch(`${API_BASE_URL}/track-price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to track price');
  }

  return response.json();
}

export async function getPriceHistoryUrl(productUrl) {
  const response = await fetch(`${API_BASE_URL}/get-price-history-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productUrl }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get price history URL');
  }

  return data;
}

export async function getPriceHistory(store, productName) {
  const response = await fetch(
    `${API_BASE_URL}/price-history/${store}/${encodeURIComponent(productName)}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to fetch price history');
  }

  return response.json();
}
