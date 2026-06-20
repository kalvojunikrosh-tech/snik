import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.ts';
import { Product, Category, CartItem, WishlistItem, Order, User } from '../types.ts';

// Hook for Auth Management
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('sneakerverse_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.getProfile();
      setUser(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      localStorage.removeItem('sneakerverse_token'); // Clear corrupt token
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const result = await api.auth.login(credentials);
      setUser(result.user);
      setError(null);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const result = await api.auth.register(userData);
      setUser(result.user);
      setError(null);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLoginHandler = async (googleData: any) => {
    setLoading(true);
    try {
      const result = await api.auth.googleLogin(googleData);
      setUser(result.user);
      setError(null);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    googleLogin: googleLoginHandler,
    refreshProfile: fetchProfile,
  };
}

// Hook for Products Retrieval
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await api.products.getAll(filters);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
  };
}

// Hook for Categories Retrieval
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.categories.getAll();
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
  };
}

// Hook for Shopping Cart Operations (Fully Backend Synced)
export function useCart(userId: string | undefined) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const items = await api.cart.get();
      setCartItems(items);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToCart = async (productId: string, size: string, quantity = 1) => {
    setLoading(true);
    try {
      await api.cart.add(productId, size, quantity);
      setError(null);
      await fetchCart();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      await api.cart.update(itemId, quantity);
      setError(null);
      await fetchCart();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setLoading(true);
    try {
      await api.cart.remove(itemId);
      setError(null);
      await fetchCart();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await api.cart.clear();
      setCartItems([]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart, userId]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
}

// Hook for Wishlist
export function useWishlist(userId: string | undefined) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const items = await api.wishlist.get();
      setWishlistItems(items);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleWishlist = async (productId: string) => {
    if (!userId) {
      throw new Error('Please login to safe sneakers to your wishlist.');
    }
    setLoading(true);
    try {
      const res = await api.wishlist.toggle(productId);
      setError(null);
      await fetchWishlist();
      return res;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, userId]);

  return {
    wishlistItems,
    loading,
    error,
    toggleWishlist,
    refreshWishlist: fetchWishlist,
  };
}
