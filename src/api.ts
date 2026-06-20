// Sneakerverse API Service Layer - Mock-free, connecting front-end directly to Express backend
const API_BASE = '/api';

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('sneakerverse_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch {
      // JSON parsing failed
    }
    throw new Error(errorMsg);
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const api = {
  // Authentication
  auth: {
    async register(data: any) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async login(data: any) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleResponse(res);
      if (result && result.token) {
        localStorage.setItem('sneakerverse_token', result.token);
      }
      return result;
    },

    async googleLogin(data: any) {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleResponse(res);
      if (result && result.token) {
        localStorage.setItem('sneakerverse_token', result.token);
      }
      return result;
    },

    async forgotPassword(email: string) {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return handleResponse(res);
    },

    async resetPassword(data: any) {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async getProfile() {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async updateProfile(data: any) {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    logout() {
      localStorage.removeItem('sneakerverse_token');
    },
  },

  // Products & Drops
  products: {
    async getAll(filters: { category?: string; search?: string; minPrice?: string; maxPrice?: string; sort?: string } = {}) {
      const params = new URLSearchParams() as any;
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/products${qs}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async getBySlug(slug: string) {
      const res = await fetch(`${API_BASE}/products/${slug}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async getDrops() {
      const res = await fetch(`${API_BASE}/products/drops`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async addProduct(data: any) {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },

  // Categories
  categories: {
    async getAll() {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Shopping Cart (Synchronized to Backend Database)
  cart: {
    async get() {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async add(productId: string, size: string, quantity = 1) {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, size, quantity }),
      });
      return handleResponse(res);
    },

    async update(itemId: string, quantity: number) {
      const res = await fetch(`${API_BASE}/cart/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity }),
      });
      return handleResponse(res);
    },

    async remove(itemId: string) {
      const res = await fetch(`${API_BASE}/cart/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async clear() {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Wishlist / Favorites
  wishlist: {
    async get() {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async toggle(productId: string) {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId }),
      });
      return handleResponse(res);
    },
  },

  // Orders & Checkouts
  orders: {
    async create(data: {
      addressId?: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      paymentMethod: string;
    }) {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async getAll() {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async getById(orderId: string) {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Reviews
  reviews: {
    async getByProduct(productId: string) {
      const res = await fetch(`${API_BASE}/reviews/${productId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async add(productId: string, rating: number, comment: string) {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, rating, comment }),
      });
      return handleResponse(res);
    },
  },

  // AI Recommendation Engine
  recommendations: {
    async get(data: { budget: string; brand: string; shoeType: string; color: string; activity: string }) {
      const res = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },
};
