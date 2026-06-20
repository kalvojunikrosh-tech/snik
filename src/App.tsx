import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Filter,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  MapPin,
  CreditCard,
  Percent,
  LogOut,
  Sparkles,
  Lock,
  Mail,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './api.ts';
import { useAuth, useProducts, useCategories, useCart, useWishlist } from './hooks/useApi.ts';
import { Product, Category, CartItem, Order, VirtualDrop, WishlistItem } from './types.ts';
import AiRecommender from './components/AiRecommender.tsx';
import HeroSection from './components/HeroSection.tsx';

export default function App() {
  // Current datetime simulation
  const [currentUtc, setCurrentUtc] = useState('2026-06-20 06:15:00 UTC');
  
  // API and Auth hooks
  const { user, login, register, googleLogin, logout, refreshProfile, loading: authLoading } = useAuth();
  const { products, loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { cartItems, loading: cartLoading, addToCart, updateQuantity, removeFromCart, clearCart } = useCart(user?.id);
  const { wishlistItems, toggleWishlist } = useWishlist(user?.id);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Navigation / Drawer visibility states
  const [activeTab, setActiveTab] = useState<'shop' | 'drops' | 'dashboard' | 'recommendations'>('shop');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  const [showAuthDrawer, setShowAuthDrawer] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductReviews, setSelectedProductReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Single Product Gallery Index
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ token: '', newPassword: '' });
  const [checkoutForm, setCheckoutForm] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    paymentMethod: 'CREDIT_CARD',
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    retailPrice: '',
    brand: '',
    colorway: '',
    releaseDate: '2026-06-20',
    stock: '15',
    isCryptoExclusive: false,
    categoryId: '',
    image: '',
  });

  // Flow states
  const [isCheckoutSlide, setIsCheckoutSlide] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Drops details
  const [drops, setDrops] = useState<VirtualDrop[]>([]);
  const [dropsLoading, setDropsLoading] = useState(false);

  // Admin section toggle
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Notification triggers
  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Clock Sync
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Format as YYYY-MM-DD HH:MM:SS UTC
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setCurrentUtc(formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch product list when filters change
  const handleFetchFilteredProducts = useCallback(() => {
    fetchProducts({
      category: selectedCategory,
      search: searchQuery,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sort: sortBy,
    });
  }, [fetchProducts, selectedCategory, searchQuery, priceRange.min, priceRange.max, sortBy]);

  useEffect(() => {
    handleFetchFilteredProducts();
  }, [handleFetchFilteredProducts]);

  // Fetch virtual drops
  const fetchDropsData = useCallback(async () => {
    setDropsLoading(true);
    try {
      const data = await api.products.getDrops();
      setDrops(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setDropsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDropsData();
  }, [fetchDropsData]);

  // Fetch orders when user goes to dashboard
  const handleFetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const data = await api.orders.getAll();
      setOrders(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      handleFetchOrders();
    }
  }, [activeTab, handleFetchOrders]);

  // Handle opening product detail
  const handleViewProductDetail = async (product: Product) => {
    setReviewsLoading(true);
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setSelectedSize(product.sizes.split(',')[0] || '');
    try {
      // Get detailed product with market history and reviews from DB
      const detailed = await api.products.getBySlug(product.slug);
      setSelectedProduct(detailed);
      setSelectedProductReviews(detailed.reviews || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Submit product review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerNotification('error', 'Authentication required to post reviews.');
      setAuthMode('login');
      setShowAuthDrawer(true);
      return;
    }
    if (!reviewForm.comment.trim()) {
      triggerNotification('error', 'Please write a review comment.');
      return;
    }
    setFormLoading(true);
    try {
      await api.reviews.add(selectedProduct!.id, reviewForm.rating, reviewForm.comment);
      // Reload reviews
      const detailed = await api.products.getBySlug(selectedProduct!.slug);
      setSelectedProductReviews(detailed.reviews || []);
      setReviewForm({ rating: 5, comment: '' });
      triggerNotification('success', 'Your cyber review has been minted on-chain!');
    } catch (err: any) {
      triggerNotification('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Submitting Auth forms
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setAuthError(null);
    try {
      await login(loginForm);
      setShowAuthDrawer(false);
      triggerNotification('success', 'Authenticated successfully! Welcoming back.');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setAuthError(null);
    try {
      await register(registerForm);
      setShowAuthDrawer(false);
      triggerNotification('success', 'Registered and authenticated successfully!');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setAuthError(null);
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      triggerNotification('success', 'Reset token generated! Copy the token from below.');
      setAuthMode('reset');
      setResetForm((prev) => ({ ...prev, token: res.resetToken || '' }));
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setAuthError(null);
    try {
      await api.auth.resetPassword(resetForm);
      triggerNotification('success', 'Password reset successful! Please log in.');
      setAuthMode('login');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Quick Google Auth Simulation
  const handleGoogleLoginSimulate = async () => {
    setFormLoading(true);
    setAuthError(null);
    try {
      const gUser = {
        email: 'user@gmail.com',
        googleId: 'google_oauth_1234567890',
        name: 'Kalvo Junikrosh',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      };
      await googleLogin(gUser);
      setShowAuthDrawer(false);
      triggerNotification('success', 'Google Single Sign-On Completed!');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Add Item safely
  const handleAddItemToCart = async (product: Product, size: string) => {
    if (!user) {
      triggerNotification('error', 'Please login to add items to your shopping cart.');
      setAuthMode('login');
      setShowAuthDrawer(true);
      return;
    }
    if (!size) {
      triggerNotification('error', 'Please select a sizes before adding.');
      return;
    }
    try {
      await addToCart(product.id, size, 1);
      triggerNotification('success', `Added ${product.brand} ${product.name} (Size ${size}) to cart!`);
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Toggle wishlist
  const handleWishlistToggle = async (product: Product) => {
    if (!user) {
      triggerNotification('error', 'Please sign in to save favorites.');
      setAuthMode('login');
      setShowAuthDrawer(true);
      return;
    }
    try {
      const res = await toggleWishlist(product.id);
      if (res.active) {
        triggerNotification('success', `Added to virtual wishlist!`);
      } else {
        triggerNotification('success', `Removed from wishlist`);
      }
    } catch (err: any) {
      triggerNotification('error', err.message);
    }
  };

  // Checkout submission
  const handlePlaceOrderCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      triggerNotification('error', 'Shopping cart is empty!');
      return;
    }
    setFormLoading(true);
    try {
      const res = await api.orders.create(checkoutForm);
      triggerNotification('success', `Order placed successfully! Order ID: ${res.orderId.substring(0, 8)}`);
      setIsCheckoutSlide(false);
      setShowCartDrawer(false);
      clearCart();
      setActiveTab('dashboard'); // Redirect to order list
    } catch (err: any) {
      triggerNotification('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Create new item (Admin)
  const handleCreateProductAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.slug || !newProductForm.name || !newProductForm.price || !newProductForm.categoryId) {
      triggerNotification('error', 'All core fields are required.');
      return;
    }
    setFormLoading(true);
    try {
      const fileUrl = newProductForm.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
      const prodPayload = {
        ...newProductForm,
        image: fileUrl,
        gallery: `${fileUrl},https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=650`,
        stock: parseInt(newProductForm.stock) || 12,
        price: parseFloat(newProductForm.price),
        retailPrice: parseFloat(newProductForm.retailPrice || newProductForm.price),
      };

      await api.products.addProduct(prodPayload);
      triggerNotification('success', `New Digital Drop Product added directly to the database!`);
      setShowAdminPanel(false);
      handleFetchFilteredProducts(); // Reload products feed
    } catch (err: any) {
      triggerNotification('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Simulate Drops Mint
  const handleMintDrop = async (drop: VirtualDrop) => {
    if (!user) {
      triggerNotification('error', 'Authenticate to unlock virtual drops.');
      setAuthMode('login');
      setShowAuthDrawer(true);
      return;
    }
    setFormLoading(true);
    try {
      // Find the Category ID for Neon or Minimal to hook order up
      const catId = categories[0]?.id || '';
      
      // Auto register drop as product first in SQLite
      const generatedSlug = drop.name.toLowerCase().replace(/\s+/g, '-');
      const mockProduct = {
        name: drop.name,
        slug: generatedSlug,
        description: drop.description,
        price: drop.price,
        retailPrice: drop.price,
        image: drop.image,
        gallery: drop.image,
        sizes: '8,9,10,11',
        brand: drop.brand,
        colorway: 'Exclusive Drop',
        releaseDate: '2026-06-20',
        categoryId: catId || 'drop-category',
        stock: drop.supply - 1,
      };

      // Add to database
      let pDb;
      try {
        pDb = await api.products.addProduct(mockProduct);
      } catch {
        // Product might already be registered in SQLite, fetch it
        const productsList = await api.products.getAll();
        pDb = productsList.find((p: any) => p.slug === generatedSlug);
      }

      const verifiedProduct = pDb as Product;
      
      // Add to shopping cart instantly and open checkout process
      await addToCart(verifiedProduct.id, '10', 1);
      triggerNotification('success', `${drop.name} successfully claimed as exclusive drop! Complete minting at checkout.`);
      setShowCartDrawer(true);
      setIsCheckoutSlide(true);
      setCheckoutForm((prev) => ({
        ...prev,
        street: '404 Sneaker Street',
        city: 'Metaspaces Center',
        state: 'S-79',
        postalCode: '66291',
        country: 'Cyberspace',
        paymentMethod: 'CRYPTO',
      }));
    } catch (err: any) {
      triggerNotification('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Calculator helper
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartTax = cartSubtotal * 0.0825; // Tax rate
  const cartTotal = cartSubtotal + cartTax;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
      
      {/* Background Matrix Particle Ambient Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-gray-950 -z-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b0f19_1px,transparent_1px),linear-gradient(to_bottom,#0b0f19_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 -z-40" />

      {/* Floating System Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            id="global-portal-alerts"
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/5 backdrop-blur-xl shadow-2xl"
            style={{
              backgroundColor: notification.type === 'success' ? 'rgba(6, 15, 12, 0.95)' : 'rgba(20, 10, 10, 0.95)',
              borderColor: notification.type === 'success' ? 'rgba(0, 240, 255, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              boxShadow: notification.type === 'success' ? '0 10px 30px rgba(0, 240, 255, 0.15)' : '0 10px 30px rgba(239, 68, 68, 0.15)'
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-cyan-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className="font-medium text-sm tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Floating Luxury Navigation Header */}
      <div className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 transition-all duration-300">
        <header className="max-w-7xl mx-auto rounded-full border border-white/5 bg-black/60 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] luxury-glass">
          <div className="px-6 h-20 flex items-center justify-between gap-4">
            
            {/* Brand Logo & Live Ticker */}
            <div className="flex items-center gap-5">
              <div className="flex flex-col">
                <span className="font-display font-black tracking-[0.15em] text-xl text-white uppercase select-none flex items-center gap-1.5">
                  SNIK
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#A1A1AA] mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span>CYBER METAMARKET LIVE</span>
                  <span className="px-1 text-zinc-800">|</span>
                  <span>{currentUtc}</span>
                </div>
              </div>
            </div>

            {/* Center Tabs Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 bg-black/40 p-1.5 rounded-full border border-white/5 font-display">
              <button
                onClick={() => setActiveTab('shop')}
                className={`relative px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition ${
                  activeTab === 'shop' ? 'bg-white text-black shadow-lg font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                METAFEED
              </button>
              <button
                onClick={() => setActiveTab('drops')}
                className={`relative px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition flex items-center gap-1.5 ${
                  activeTab === 'drops' ? 'bg-white text-black shadow-lg font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                VIRTUAL DROPS
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              </button>
              <button
                id="desktop-nav-ai-recommender"
                onClick={() => setActiveTab('recommendations')}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition flex items-center gap-1.5 ${
                  activeTab === 'recommendations' ? 'bg-white text-black shadow-lg font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-950 fill-current" />
                AI RECOMMENDER
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setAuthMode('login');
                    setShowAuthDrawer(true);
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition ${
                  activeTab === 'dashboard' ? 'bg-white text-black shadow-lg font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                MY HUD
              </button>
            </nav>

            {/* Right Action Icons Panel */}
            <div className="flex items-center gap-3">
              {/* Wishlist Button */}
              <button
                onClick={() => setShowWishlistDrawer(true)}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-[#00E5FF] transition-all relative border border-white/5 active:scale-95"
              >
                <Heart className="w-4 h-4" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Shopping Bag Button */}
              <button
                onClick={() => setShowCartDrawer(true)}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-[#00E5FF] transition-all relative border border-white/5 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#00E5FF] text-[10px] font-black text-slate-950 rounded-full flex items-center justify-center">
                    {cartItems.reduce((acc, current) => acc + current.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Auth Profile / Sign-in Status */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="hidden sm:flex flex-col items-end text-[11px] font-display"
                  >
                    <span className="font-semibold text-white tracking-tight leading-none">{user.name}</span>
                    <span className="text-[#00E5FF] uppercase font-mono tracking-widest text-[8px] mt-1">
                      {user.role}
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="p-3 rounded-full bg-gradient-to-tr from-[#00E5FF]/20 to-purple-500/20 border border-white/10 text-white hover:bg-white/10 transition"
                    >
                      <UserIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={logout}
                      className="p-3 rounded-full bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition"
                      title="Disconnect Avatar"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthDrawer(true);
                  }}
                  className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#00E5FF]/30 text-xs font-semibold tracking-wider text-white bg-white/5 hover:bg-white/10 hover:text-[#00E5FF] transition-all flex items-center gap-2 font-display active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  LINK AVATAR
                </button>
              )}
            </div>

          </div>
        </header>
      </div>

      {/* Sub tabs on mobile - Luxury Floating Capsule */}
      <div className="md:hidden flex px-4 py-2 justify-around gap-1.5 sticky top-[80px] z-30 mx-4 my-2 rounded-full border border-white/5 bg-black/80 backdrop-blur-2xl luxury-glass">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 text-center py-2.5 text-[10px] font-semibold tracking-wider rounded-full transition-all ${
            activeTab === 'shop' ? 'bg-white text-black font-bold' : 'text-zinc-400'
          }`}
        >
          METAFEED
        </button>
        <button
          onClick={() => setActiveTab('drops')}
          className={`flex-1 text-center py-2.5 text-[10px] font-semibold tracking-wider rounded-full transition-all ${
            activeTab === 'drops' ? 'bg-white text-black font-bold' : 'text-zinc-400'
          }`}
        >
          DROPS
        </button>
        <button
          id="mobile-nav-ai-recommender"
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 text-center py-2.5 text-[10px] font-semibold tracking-wider rounded-full transition-all ${
            activeTab === 'recommendations' ? 'bg-white text-black font-bold' : 'text-zinc-400'
          }`}
        >
          AI RECOMMENDER
        </button>
        <button
          onClick={() => {
            if (!user) {
              setAuthMode('login');
              setShowAuthDrawer(true);
            } else {
              setActiveTab('dashboard');
            }
          }}
          className={`flex-1 text-center py-2.5 text-[10px] font-semibold tracking-wider rounded-full transition-all ${
            activeTab === 'dashboard' ? 'bg-white text-black font-bold' : 'text-zinc-400'
          }`}
        >
          MY HUD
        </button>
      </div>

      {/* Primary Layout Segment */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* FEED / SHOP TABS */}
        {activeTab === 'shop' && (
          <div className="space-y-12">
            
            {/* Cinematic Luxury Landing Hero */}
            <HeroSection
              onExploreClick={() => {
                const target = document.getElementById('shop-filters-grid');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              onViewProductSlug={(slug) => {
                const matched = products.find((p) => p.slug === slug) || products[0];
                if (matched) {
                  handleViewProductDetail(matched);
                }
              }}
            />
            
            {/* Interactive Upcoming Drops Call-out Slider Card */}
            {drops.length > 0 && (
              <div 
                onClick={() => setActiveTab('drops')}
                className="cursor-pointer group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-gray-950 via-rose-950/20 to-gray-950 p-[1px] shadow-2xl transition hover:border-rose-400/55"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent -z-10 group-hover:opacity-100 transition duration-500" />
                <div className="bg-gray-950/90 rounded-[15px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-rose-500/5 flex items-center justify-center p-1.5 border border-rose-500/20">
                      <img src={drops[0].image} alt={drops[0].name} className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-500 text-[8px] font-black uppercase text-white animate-pulse">
                        LIVE DROP
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold tracking-widest text-rose-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        EXCLUSIVE METAVERSE RELEASE
                      </span>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight uppercase group-hover:text-rose-200 transition">
                        {drops[0].name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1 max-w-lg">
                        {drops[0].description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl">
                      <span className="text-xs font-semibold tracking-wider text-rose-400">SUPPLY LEVEL:</span>
                      <span className="font-mono text-sm font-black text-white">{drops[0].supply} LOBBY PLACES</span>
                    </div>
                    <button className="glow-btn-purple font-display px-6 py-2.5 bg-rose-500 text-white rounded-lg text-xs font-bold tracking-widest flex items-center gap-2 uppercase group-hover:bg-rose-600 transition">
                      Claim Allocation
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter controls panel - Luxury Redesign */}
            <div id="shop-filters-grid" className="space-y-6 pt-4 scroll-mt-28">
              
              {/* Toolbar search input and chips */}
              <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between p-6 rounded-3xl luxury-glass-light border border-white/5">
                {/* Search Text */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search extreme luxury catalog (Brand, Colorway, Virtual specs)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-full pl-12 pr-4 py-3 text-xs text-white focus:outline-none transition-all font-sans font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                {/* Additional controls and toggles */}
                <div className="flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
                  {/* Category Option chips */}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-5 py-2.5 rounded-full text-[10px] font-semibold tracking-wider transition-all uppercase font-display ${
                      !selectedCategory ? 'bg-white text-black font-bold' : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    ALL CATALOGS
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-5 py-2.5 rounded-full text-[10px] font-semibold tracking-wider transition-all whitespace-nowrap uppercase font-display ${
                        selectedCategory === cat.slug ? 'bg-white text-black font-bold' : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-full border transition-all flex items-center justify-center gap-2 ${
                      showFilters ? 'bg-[#00E5FF] border-[#00E5FF] text-black font-bold' : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider font-display hidden sm:inline">Filters</span>
                  </button>

                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="px-5 py-2.5 rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/10 text-white hover:bg-[#7C3AED]/20 hover:border-[#7C3AED]/60 transition-all flex items-center gap-1.5 text-[10px] uppercase font-bold font-display"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  )}
                </div>
              </div>

              {/* Slider panel for Quantum Filters */}
              {showFilters && (
                <div className="bg-slate-900 rounded-xl p-5 border border-white/5 flex flex-wrap gap-6 items-end justify-between">
                  
                  {/* Min / Max Price fields */}
                  <div className="flex items-center gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">MIN PRICE (CR)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                        className="bg-gray-950 border border-white/5 hover:border-white/10 focus:border-cyan-400/50 rounded-lg px-3 py-2 text-xs text-white content-center w-28 focus:outline-none transition font-mono"
                      />
                    </div>
                    <span className="text-gray-500 pt-5">TO</span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">MAX PRICE (CR)</label>
                      <input
                        type="number"
                        placeholder="9999"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                        className="bg-gray-950 border border-white/5 hover:border-white/10 focus:border-cyan-400/50 rounded-lg px-3 py-2 text-xs text-white content-center w-28 focus:outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  {/* Ordering filter Options */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">ORDER SEQUENCE</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-950 border border-white/5 hover:border-white/10 focus:border-cyan-400/50 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none transition"
                    >
                      <option value="newest">DATETIME_RELEASE: RECENT_FIRST</option>
                      <option value="price-asc">COINS_VAL: ASCENDING</option>
                      <option value="price-desc">COINS_VAL: DESCENDING</option>
                      <option value="popular">METRIC_POPULARITY</option>
                    </select>
                  </div>

                  {/* Clean up Filter buttons */}
                  <button
                    onClick={() => {
                      setPriceRange({ min: '', max: '' });
                      setSortBy('newest');
                      setSearchQuery('');
                      setSelectedCategory('');
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold tracking-wider text-red-400 transition"
                  >
                    RESET SYSTEM FILTERS
                  </button>

                </div>
              )}

            </div>

            {/* Loaders/Feed view status */}
            {productsLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-cyan-400/85 uppercase tracking-widest">
                  ACCESSING SNIK DATA_STREAMS...
                </span>
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center space-y-3 bg-white/5 border border-white/5 rounded-2xl">
                <Search className="w-10 h-10 text-gray-500 mx-auto" />
                <h4 className="font-display font-bold text-lg text-white">No Quantum Silhouettes Found</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Adjust your search parameters or select a different meta category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchQuery('');
                    setPriceRange({ min: '', max: '' });
                  }}
                  className="mt-4 px-4 py-2 bg-cyan-500 text-black text-xs font-bold tracking-widest uppercase rounded-lg"
                >
                  Reload Feed
                </button>
              </div>
            ) : (
              /* Product grids displayed flawlessly */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const sizeList = product.sizes.split(',');
                  const isFavorited = wishlistItems.some((w) => w.productId === product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleViewProductDetail(product)}
                      className="group flex flex-col bg-zinc-950/45 rounded-[24px] border border-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-2.5 hover:border-zinc-700/50 shadow-2xl relative cursor-pointer"
                      style={{
                        boxShadow: product.isCryptoExclusive ? '0 15px 40px rgba(0, 229, 255, 0.04)' : 'none',
                      }}
                    >
                      {/* Product launcher labels */}
                      {product.isCryptoExclusive && (
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white text-black text-[8px] font-mono font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 fill-current" />
                          EXCLUSIVE
                        </div>
                      )}

                      {/* Favorite Button on top right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlistToggle(product);
                        }}
                        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border transition-all duration-300 ${
                          isFavorited
                            ? 'text-red-500 bg-red-500/10 border-red-500/20'
                            : 'text-zinc-400 bg-black/60 backdrop-blur-md border-white/5 hover:text-white hover:bg-black/80'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" style={{ fillOpacity: isFavorited ? 1 : 0 }} />
                      </button>

                      {/* Image Viewer */}
                      <div className="aspect-[4/3] w-full bg-[#080808] overflow-hidden relative flex items-center justify-center p-6 border-b border-white/5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-[85%] h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-2"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="px-5 py-2.5 bg-white text-black font-display font-bold text-[9px] tracking-widest uppercase rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                            EXPLORE SPEC
                          </span>
                        </div>
                      </div>

                      {/* Text descriptors */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-[#00E5FF]">
                              {product.brand}
                            </span>
                            <span className="font-mono text-[8px] text-zinc-500 tracking-wider">
                              EST: {product.releaseDate}
                            </span>
                          </div>
                          <h4 className="font-display font-medium text-base leading-tight text-white uppercase tracking-tight group-hover:text-[#00E5FF] transition duration-300 line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                            {product.description}
                          </p>
                        </div>

                        {/* Row with Sizes available preview to tap easily */}
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <span className="block font-mono text-[8px] tracking-widest text-[#A1A1AA] uppercase">SIZES AVAILABLE</span>
                          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                            {sizeList.slice(0, 5).map((size) => (
                              <span key={size} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-300">
                                {size}
                              </span>
                            ))}
                            {sizeList.length > 5 && (
                              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-400">
                                +{sizeList.length - 5}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action section buying/adding */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-[8px] font-bold text-zinc-500 uppercase tracking-widest">VALUE</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-black text-lg text-white">
                                {product.price.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-[#00E5FF] font-mono font-bold tracking-wide">CR</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddItemToCart(product, sizeList[0] || '10');
                            }}
                            className="px-5 py-2.5 bg-white hover:bg-zinc-200 active:scale-95 text-black font-display font-bold text-[9px] tracking-widest uppercase rounded-full transition duration-300 flex items-center gap-1 shrink-0"
                          >
                            Acquire
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* UPCOMING VIRTUAL DROPS SECTION */}
        {activeTab === 'drops' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <span className="px-4 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono tracking-widest uppercase rounded-full font-bold">
                VIRTUAL LOBBY DROPS
              </span>
              <h2 className="font-display font-black text-4xl text-white tracking-tight uppercase luxury-text-gradient">
                Upcoming Cyber Releases
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                snik scheduled virtual sneaker drops are limited-edition cyber releases that mint instantly in real-time lobbies. Configure your avatar and check back for claim access.
              </p>
            </div>

            {dropsLoading ? (
              <div className="py-24 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#00E5FF] animate-spin" />
              </div>
            ) : drops.length === 0 ? (
              <div className="py-24 text-center text-zinc-500 font-mono text-xs">
                No active drops scheduled in system streams.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {drops.map((drop) => {
                  const releaseDate = new Date(drop.releaseTime);
                  const isLive = releaseDate.getTime() <= Date.now() + 1000 * 60 * 60; // Mock live drops within hour

                  return (
                    <div
                      key={drop.id}
                      className="bg-zinc-950/45 border border-white/5 rounded-[28px] overflow-hidden shadow-2xl relative flex flex-col justify-between group luxury-glass transition-all duration-500 hover:-translate-y-1.5"
                      style={{
                        borderColor: isLive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: isLive ? '0 15px 40px rgba(239, 68, 68, 0.05)' : 'none',
                      }}
                    >
                      {/* Drop Image viewer */}
                      <div className="aspect-[16/10] w-full bg-[#080808] relative overflow-hidden flex items-center justify-center border-b border-white/5 p-6">
                        <img 
                          src={drop.image} 
                          alt={drop.name} 
                          className="w-[85%] h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/5 font-mono text-[8px] font-bold text-rose-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          LOBBY RUN: 1 MINUTE LIMIT
                        </div>
                      </div>

                      {/* Drop Info details */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono font-bold tracking-widest text-[#00E5FF] uppercase">
                              {drop.brand}
                            </span>
                            <span className="font-mono text-zinc-500">
                              TOTAL MINT SUPPLY: {drop.supply}
                            </span>
                          </div>
                          <h3 className="font-display font-medium text-lg uppercase tracking-tight text-white leading-tight">
                            {drop.name}
                          </h3>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
                            {drop.description}
                          </p>
                        </div>

                        {/* Ticker values */}
                        <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-mono text-[8px] tracking-widest text-zinc-500 uppercase">MINT PRICE</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-black text-lg text-white">{drop.price.toLocaleString()}</span>
                              <span className="font-mono text-[9px] text-[#00E5FF] font-bold">CR</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLive ? (
                              <button
                                onClick={() => handleMintDrop(drop)}
                                className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-full text-[9px] font-bold font-display tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all duration-300 flex items-center gap-1.5"
                              >
                                <Award className="w-4 h-4" />
                                MINT NOW
                              </button>
                            ) : (
                              <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[9px] font-mono font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wide">
                                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                                MINT LOCKED
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI RECOMMENDER VIEW */}
        {activeTab === 'recommendations' && (
          <AiRecommender
            onViewProduct={handleViewProductDetail}
            onAddToCart={(product, size) => addToCart(product.id, size)}
            wishlistItems={wishlistItems}
            onToggleWishlist={handleWishlistToggle}
          />
        )}

        {/* USER PROFILE / HUD PORTAL */}
        {activeTab === 'dashboard' && user && (
          <div className="space-y-8">
            
            {/* HUD Title segment - Luxury Redesign */}
            <div className="bg-zinc-950/45 border border-white/5 rounded-[32px] p-8 sm:p-10 flex flex-col md:flex-row gap-6 md:items-center justify-between shadow-2xl luxury-glass">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-display font-medium text-xl">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display font-black text-3xl text-white uppercase tracking-tight leading-tight luxury-text-gradient">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 mt-1">
                    <span className="text-[#00E5FF] font-medium">{user.email}</span>
                    <span className="text-zinc-700">•</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 font-bold text-[9px] uppercase text-zinc-300">
                      ID: {user.id.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-zinc-500 tracking-widest font-bold">STATUS SECURITY LEVEL</span>
                <span className="px-4 py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] rounded-full font-mono font-bold text-xs flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                  AUTHENTICATED_SECURE
                </span>
              </div>
            </div>

            {/* Profile address list and order list grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Order Lists */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-display font-medium text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
                  <Layers className="w-4 h-4 text-[#00E5FF]" />
                  Transaction Ledger History
                </h3>

                {ordersLoading ? (
                  <div className="py-12 flex justify-center">
                    <RefreshCw className="w-6 h-6 text-[#00E5FF] animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-zinc-950/20 p-12 sm:p-16 text-center rounded-[28px] border border-white/5 space-y-4 luxury-glass">
                    <Layers className="w-8 h-8 text-zinc-700 mx-auto" />
                    <span className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                      LEDGER EMPTY
                    </span>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                      You have not completed any order checkout transactions. Return to the premium feed to acquire styles.
                    </p>
                    <button
                      onClick={() => setActiveTab('shop')}
                      className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase rounded-full font-display tracking-widest"
                    >
                      BROWSE METAFEED
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-zinc-950/45 border border-white/5 rounded-3xl p-6 hover:border-zinc-700/50 transition-all duration-300 space-y-4 shadow-xl"
                      >
                        {/* Summary of Order header */}
                        <div className="flex flex-wrap gap-3 items-center justify-between text-xs pb-3 border-b border-white/5">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <span className="font-mono text-[10px] text-zinc-500">TXN:</span>
                            <span className="font-mono text-white font-semibold uppercase">{ord.id.substring(0, 16)}...</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-black text-white">{ord.total.toLocaleString()} CR</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#00E5FF]/15 text-[10px] font-black uppercase text-[#00E5FF] border border-[#00E5FF]/20 font-mono">
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* List items under order */}
                        <div className="space-y-3">
                          {ord.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 border border-white/5 p-1 flex items-center justify-center">
                                  <img src={item.product?.image} alt={item.product?.name} className="w-10 h-auto object-contain" referrerPolicy="no-referrer" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="block text-xs font-semibold text-white uppercase tracking-tight line-clamp-1">
                                    {item.product?.name}
                                  </span>
                                  <span className="block text-[9px] text-zinc-500 font-mono">
                                    BRAND: {item.product?.brand} | CALIBRATION: {item.size} | QTY: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono text-xs font-bold text-zinc-300 shrink-0">
                                {item.price.toLocaleString()} CR
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Payment info detail */}
                        {ord.payment && (
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between bg-black/40 -mx-6 -mb-6 p-4 rounded-b-3xl text-[9px] font-mono">
                            <span className="text-zinc-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                              DESTINATION: {ord.city}, {ord.country}
                            </span>
                            <span className="text-amber-400 font-bold tracking-tight uppercase">
                              METHOD: {ord.payment.method} / SUCCESS
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar panels for addresses */}
              <div className="space-y-6">
                
                {/* Identity profile update panel */}
                <div className="bg-zinc-950/45 border border-white/5 rounded-[24px] p-6 space-y-4 shadow-xl">
                  <h4 className="font-display font-medium text-xs text-white uppercase tracking-widest border-b border-white/5 pb-3">
                    AVATAR CONFS
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[8px] text-zinc-500 uppercase font-mono tracking-widest">EMAIL ADDRESS</span>
                      <span className="block text-xs text-white bg-black/45 px-3.5 py-2.5 rounded-xl border border-white/5 mt-1 font-mono">{user.email}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-500 uppercase font-mono tracking-widest">ROLE PERMISSION</span>
                      <span className="block text-xs text-[#00E5FF] bg-[#00E5FF]/5 px-3.5 py-2.5 rounded-xl border border-white/5 mt-1 font-mono uppercase font-black tracking-widest">{user.role}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery details panel */}
                <div className="bg-zinc-950/45 border border-white/5 rounded-[24px] p-6 space-y-4 shadow-xl">
                  <h4 className="font-display font-medium text-xs text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-3">
                    <MapPin className="w-4 h-4 text-[#00E5FF]" />
                    DESTINATIONS
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-black/45 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[8px] font-mono font-bold text-[#00E5FF] uppercase mb-2">
                        <span>METACITY PORT 01 (DEFAULT)</span>
                        <span className="w-2 h-2 rounded bg-[#00E5FF]" />
                      </div>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        404 Neon Boulevard, Sector 9<br />
                        Neo Tokyo, Kanto, 100-0001<br />
                        Japan
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* SNEAKER EXPERIMENTAL HIGHER DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div 
            id="fullscale-quantum-scan"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Modal Ambient Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            />

            {/* Modal Contents Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* Close toggle button on upper right corner */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 border border-white/5 text-zinc-400 hover:text-white transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column visual sneaker preview images */}
              <div className="w-full md:w-1/2 bg-black/30 border-r border-white/5 p-8 flex flex-col justify-between h-[35vh] md:h-full overflow-y-auto">
                <div className="flex-1 flex items-center justify-center p-4">
                  <img
                    src={selectedProduct.gallery.split(',')[activeImageIndex] || selectedProduct.image}
                    alt={selectedProduct.name}
                    className="max-h-[22vh] md:max-h-[45vh] object-contain rounded-2xl transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Sub thumbnails selector items */}
                <div className="flex gap-2 justify-center py-2 overflow-x-auto no-scrollbar">
                  {selectedProduct.gallery.split(',').map((imgUrl, idx) => (
                    <button
                      key={imgUrl}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl bg-black/40 border overflow-hidden p-1 transition-all duration-350 shrink-0 ${
                        activeImageIndex === idx ? 'border-[#00E5FF] scale-105' : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail preview" className="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column Specifications, Live Analytics Charts, Sizes, checkout and Reviews */}
              <div className="w-full md:w-1/2 h-[50vh] md:h-full overflow-y-auto p-6 sm:p-10 space-y-6">
                
                {/* Header title */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-[#00E5FF] tracking-widest uppercase">
                    {selectedProduct.brand}
                  </span>
                  <h3 className="font-display font-medium text-2xl uppercase tracking-tight text-white leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                    <span>COLORWAY: {selectedProduct.colorway}</span>
                    <span className="text-zinc-700">•</span>
                    <span>CODENAME: {selectedProduct.slug}</span>
                  </div>
                </div>

                {/* Live Cyber Market Trading Linear Analytics Graphic Chart */}
                {selectedProduct.marketHistory && (
                  <div className="bg-black/45 p-5 border border-white/5 rounded-[24px] space-y-3 shadow-xl">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[8px] font-bold text-[#00E5FF] tracking-widest uppercase flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#00E5FF]" />
                        MARKET VALUATION (7D)
                      </span>
                      <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                        HIGH VOLATILITY
                      </span>
                    </div>

                    {/* SVG Vector linear chart mapping trade history */}
                    <div className="h-28 w-full relative pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Generating coordinate values */}
                        {(() => {
                          const prices = selectedProduct.marketHistory.map((m) => m.price);
                          const minP = Math.min(...prices) * 0.99;
                          const maxP = Math.max(...prices) * 1.01;
                          const pRange = maxP - minP;

                          const points = selectedProduct.marketHistory.map((m, i) => {
                            const x = (i / (selectedProduct.marketHistory!.length - 1)) * 400;
                            const y = 100 - ((m.price - minP) / pRange) * 80 - 10;
                            return { x, y, price: m.price };
                          });

                          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const areaD = `${pathD} L 400 100 L 0 100 Z`;

                          return (
                            <>
                              {/* Grid lines */}
                              <line x1="0" y1="10" x2="400" y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                              <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                              <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                              {/* Glowing linear path */}
                              <path d={areaD} fill="url(#chart-glow)" />
                              <path d={pathD} fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" />

                              {/* Little indicator dots */}
                              {points.map((p, idx) => (
                                <circle
                                  key={idx}
                                  cx={p.x}
                                  cy={p.y}
                                  r="2"
                                  fill="#00E5FF"
                                  className="hover:r-3.5 transition duration-300"
                                />
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                      {/* X coordinates timeline labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[7px] font-mono text-zinc-500 px-1 pt-1 border-t border-white/5">
                        <span>{selectedProduct.marketHistory[0]?.date}</span>
                        <span>{selectedProduct.marketHistory[Math.floor(selectedProduct.marketHistory.length / 2)]?.date}</span>
                        <span>{selectedProduct.marketHistory[selectedProduct.marketHistory.length - 1]?.date}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sneaker descriptions text */}
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {selectedProduct.description}
                </p>

                {/* Calibrations selections grids */}
                <div className="space-y-2.5">
                  <span className="font-mono text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">
                    Select Calibration Size (US)
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {selectedProduct.sizes.split(',').map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition-all duration-300 border ${
                          selectedSize === sz
                            ? 'bg-white border-white text-black font-black'
                            : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action pricing buy drawer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Quantum Core value</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xl font-black text-white">{selectedProduct.price.toLocaleString()}</span>
                      <span className="font-mono text-[9px] text-[#00E5FF] font-bold">CR</span>
                    </div>
                    <span className="font-mono text-[8px] text-zinc-500 uppercase">RETAIL VALUE: {selectedProduct.retailPrice.toLocaleString()} CR</span>
                  </div>

                  <button
                    onClick={() => {
                      handleAddItemToCart(selectedProduct, selectedSize);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 max-w-[200px] py-3.5 bg-white hover:bg-zinc-200 font-display font-bold text-[9px] tracking-widest uppercase text-black rounded-full transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 fill-current" />
                    Acquire
                  </button>
                </div>

                {/* Reviews feedback ledger */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h4 className="font-display font-medium text-xs text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-3">
                    TRANSACTION LOG ENTRIES
                  </h4>

                  {/* Review Submission Form */}
                  <form onSubmit={handleSubmitReview} className="bg-black/45 p-5 rounded-[24px] border border-white/5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold tracking-wider">RATE SILHOUETTE</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                            className={`p-0.5 text-xs font-black font-mono transition ${
                              star <= reviewForm.rating ? 'text-yellow-300' : 'text-gray-600'
                            }`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Mint your review feedback securely inside the sneaker log ledger..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                        className="w-full bg-zinc-950/40 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-xl p-3 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-[8px] font-bold tracking-widest uppercase rounded-full transition-all duration-300"
                      >
                        {formLoading ? 'MINTING LOG...' : 'MINT SNEAKER LOG'}
                      </button>
                    </div>
                  </form>

                  {/* Reviews lists rendered */}
                  {reviewsLoading ? (
                    <div className="flex justify-center py-4">
                      <RefreshCw className="w-5 h-5 text-[#00E5FF] animate-spin" />
                    </div>
                  ) : selectedProductReviews.length === 0 ? (
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider text-center py-4">
                      SNEAKER RECORD LOG SECURE_NO_ENTRIES
                    </p>
                  ) : (
                    <div className="space-y-3.5">
                      {selectedProductReviews.map((rev) => (
                        <div key={rev.id} className="bg-black/30 p-4 rounded-[20px] border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-[#00E5FF]">{rev.user?.name || 'Anonymous Sneakerhead'}</span>
                            <span className="text-yellow-400">{'⭐'.repeat(rev.rating)}</span>
                          </div>
                          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                            {rev.comment}
                          </p>
                          <span className="block text-[8px] text-zinc-500 font-mono tracking-wider">
                            DATE_LOGGED: {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOPPING CART DRAWER PANEL */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop toggle closing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCartDrawer(false);
                setIsCheckoutSlide(false);
              }}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            />

            {/* Slider contents */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="w-screen max-w-md bg-[#0a0a0c]/98 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-between shadow-2xl"
              >
                {/* Header Section */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-display font-medium text-sm text-white uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#00E5FF]" />
                    SHOPPING BAG ({cartItems.length})
                  </h3>
                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      setIsCheckoutSlide(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Middle items list or checkout sub-panels */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cartLoading ? (
                    <div className="py-24 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-[#00E5FF] animate-spin" />
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="py-24 text-center space-y-4 font-mono">
                      <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
                      <span className="block text-[10px] text-zinc-500 uppercase tracking-widest">
                        BAG_EMPTY_SECURE
                      </span>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto font-sans leading-relaxed">
                        There are currently no items inside your checkout bag. Return to shop feed to add calibers.
                      </p>
                    </div>
                  ) : !isCheckoutSlide ? (
                    /* Render shopping bag items */
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 bg-black/45 p-4 border border-white/5 rounded-2xl hover:border-[#00E5FF]/20 hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
                        >
                          {/* Image preview */}
                          <div className="w-16 h-16 bg-[#080808] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center p-1 shrink-0">
                            <img src={item.product?.image} alt={item.product?.name} className="w-[90%] h-auto object-contain rounded" referrerPolicy="no-referrer" />
                          </div>

                          {/* Titles description */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1">
                              {item.product?.name}
                            </h4>
                            <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                              <span>SZ {item.size}</span>
                              <span className="text-zinc-700">•</span>
                              <span>{item.product?.brand}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              {/* Count selectors */}
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 rounded bg-white/5 text-zinc-400 hover:text-white transition duration-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-xs font-bold text-white content-center px-1">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 rounded bg-white/5 text-zinc-400 hover:text-white transition duration-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Right count details */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="font-mono text-xs font-bold text-[#00E5FF]">
                              {(item.product?.price * item.quantity).toLocaleString()} CR
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 rounded text-zinc-500 hover:text-[#00E5FF] transition duration-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    /* SLIDE CHEKOUT ADDRESS DETAILS */
                    <form onSubmit={handlePlaceOrderCheckout} className="space-y-5">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#00E5FF] uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5" />
                        DESTINATION ADDRESS
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 font-mono">
                          <button
                            type="button"
                            onClick={() => {
                              setCheckoutForm({
                                street: '404 Neon Boulevard, Sector 9',
                                city: 'Neo Tokyo',
                                state: 'Kanto',
                                postalCode: '100-0001',
                                country: 'Japan',
                                paymentMethod: 'CREDIT_CARD',
                              });
                            }}
                            className="bg-white/5 hover:bg-white/10 p-2 border border-white/5 hover:border-[#00E5FF]/30 text-[8px] tracking-widest uppercase text-[#00E5FF] text-left rounded-xl transition duration-300"
                          >
                            ⭐ AUTO-FILL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCheckoutForm((p) => ({ ...p, street: '', city: '', state: '', postalCode: '', country: '' }));
                            }}
                            className="bg-white/5 hover:bg-white/10 p-2 border border-white/5 text-[8px] uppercase tracking-widest text-[#FF3B30] text-left rounded-xl transition duration-300"
                          >
                            ✖ CLEAR VALUES
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[8px] uppercase font-bold tracking-widest text-zinc-500">STREET DESTINATION</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 404 Neon Boulevard"
                            value={checkoutForm.street}
                            onChange={(e) => setCheckoutForm((prev) => ({ ...prev, street: e.target.value }))}
                            className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition duration-300 font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="text-[8px] uppercase font-bold tracking-widest text-zinc-500">CITY</label>
                            <input
                              type="text"
                              required
                              placeholder="Neo Tokyo"
                              value={checkoutForm.city}
                              onChange={(e) => setCheckoutForm((prev) => ({ ...prev, city: e.target.value }))}
                              className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition duration-300 font-sans"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] uppercase font-bold tracking-widest text-zinc-500">STATE</label>
                            <input
                              type="text"
                              required
                              placeholder="Kanto"
                              value={checkoutForm.state}
                              onChange={(e) => setCheckoutForm((prev) => ({ ...prev, state: e.target.value }))}
                              className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition duration-300 font-sans"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="text-[8px] uppercase font-bold tracking-widest text-zinc-500">POSTAL CODE</label>
                            <input
                              type="text"
                              required
                              placeholder="100-0001"
                              value={checkoutForm.postalCode}
                              onChange={(e) => setCheckoutForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                              className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition duration-300 font-sans"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] uppercase font-bold tracking-widest text-zinc-500">COUNTRY</label>
                            <input
                              type="text"
                              required
                              placeholder="Japan"
                              value={checkoutForm.country}
                              onChange={(e) => setCheckoutForm((prev) => ({ ...prev, country: e.target.value }))}
                              className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition duration-300 font-sans"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                          <label className="text-[8px] uppercase font-bold tracking-widest text-zinc-500 block mb-2.5">SECURE PAYMENT METHOD</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setCheckoutForm((p) => ({ ...p, paymentMethod: 'CREDIT_CARD' }))}
                              className={`py-2 rounded-xl border text-[9px] font-mono tracking-wider transition duration-300 ${
                                checkoutForm.paymentMethod === 'CREDIT_CARD'
                                  ? 'bg-white border-white text-black font-black'
                                  : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/10'
                              }`}
                            >
                              CREDIT CARD
                            </button>
                            <button
                              type="button"
                              onClick={() => setCheckoutForm((p) => ({ ...p, paymentMethod: 'CRYPTO' }))}
                              className={`py-2 rounded-xl border text-[9px] font-mono tracking-wider transition duration-300 ${
                                checkoutForm.paymentMethod === 'CRYPTO'
                                  ? 'bg-white border-white text-black font-black'
                                  : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/10'
                              }`}
                            >
                              CRYPTO COIN
                            </button>
                          </div>
                        </div>

                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full py-4 bg-[#00E5FF] hover:bg-[#00ffd5] text-black font-display text-[9px] font-bold tracking-widest uppercase rounded-full transition duration-300"
                        >
                          {formLoading ? 'PROCESSING TRANSACTION...' : 'COMMIT TRANSACTION LEDGER'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Bottom summaries checkout values banner */}
                {cartItems.length > 0 && (
                  <div className="p-6 border-t border-white/5 bg-[#08080a]" id="cart-summary-panel">
                    <div className="space-y-2 text-[10px] text-zinc-500 font-mono mb-4">
                      <div className="flex justify-between">
                        <span>ESTIMATED SUB_TOTAL:</span>
                        <span className="text-white">{cartSubtotal.toLocaleString()} CR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ESTIMATED TAX (8.25%):</span>
                        <span className="text-white">{Math.round(cartTax).toLocaleString()} CR</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-white pt-2 border-t border-white/5">
                        <span className="text-zinc-400 font-display">TOTAL SECURE CR:</span>
                        <span className="text-[#00E5FF] text-sm font-semibold">{Math.round(cartTotal).toLocaleString()} CR</span>
                      </div>
                    </div>

                    {!isCheckoutSlide ? (
                      <button
                        onClick={() => setIsCheckoutSlide(true)}
                        className="w-full py-4 bg-white hover:bg-zinc-200 active:scale-98 text-black font-display font-bold text-[9px] tracking-widest uppercase rounded-full transition duration-300 text-center flex items-center justify-center gap-1.5"
                      >
                        SUBMIT CALIBRATIONS ({cartItems.length})
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCheckoutSlide(false)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-[9px] tracking-widest uppercase rounded-full transition duration-300 text-center"
                      >
                        ← BACK TO BAG LEDGER
                      </button>
                    )}
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* WISHLIST SAVED DRAWER PANEL */}
      <AnimatePresence>
        {showWishlistDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWishlistDrawer(false)}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="w-screen max-w-sm bg-[#0a0a0c]/98 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-between shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-display font-medium text-sm text-white uppercase tracking-widest flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    SAVED ITEMS ({wishlistItems.length})
                  </h3>
                  <button
                    onClick={() => setShowWishlistDrawer(false)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {wishlistItems.length === 0 ? (
                    <div className="py-24 text-center text-zinc-500 space-y-3 font-mono">
                      <Heart className="w-6 h-6 mx-auto text-zinc-600" />
                      <span className="block text-[10px] uppercase tracking-widest">WISHLIST_EMPTY</span>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto font-sans leading-relaxed">
                        Your favorites are empty. Tap the heart icons on items in the metafeed to save.
                      </p>
                    </div>
                  ) : (
                    wishlistItems.map((wish) => (
                      <div
                        key={wish.id}
                        className="flex items-center gap-3 bg-black/45 p-3.5 border border-white/5 rounded-2xl hover:border-[#00E5FF]/20 hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
                      >
                        <div className="w-12 h-12 bg-[#080808] rounded-xl overflow-hidden border border-white/5 shrink-0 flex items-center justify-center p-1">
                          <img src={wish.product?.image} alt={wish.product?.name} className="w-[90%] h-auto object-contain rounded" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-semibold text-white uppercase tracking-tight line-clamp-1">
                            {wish.product?.name}
                          </span>
                          <span className="block font-mono text-[9px] text-[#00E5FF] font-medium tracking-wider">
                            {wish.product?.price.toLocaleString()} CR
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleAddItemToCart(wish.product, '10');
                              setShowWishlistDrawer(false);
                            }}
                            className="px-2.5 py-1.5 bg-white text-black font-semibold text-[8px] uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-all duration-300"
                          >
                            ADD
                          </button>
                          <button
                            onClick={() => handleWishlistToggle(wish.product)}
                            className="p-1.5 text-zinc-500 hover:text-rose-500 transition duration-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 border-t border-white/5 bg-[#08080a]">
                  <button
                    onClick={() => setShowWishlistDrawer(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-[9px] tracking-widest uppercase rounded-full transition duration-300 text-center"
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTH SYSTEM PORTALS MODAL DRAWERS */}
      <AnimatePresence>
        {showAuthDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAuthDrawer(false);
                setAuthError(null);
              }}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="w-screen max-w-md bg-[#0a0a0c]/98 backdrop-blur-2xl border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-2xl"
              >
                {/* Header segment */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex flex-col">
                    <span className="font-display font-medium text-sm text-white tracking-widest uppercase">
                      {authMode === 'login' && 'LINK PROFILE'}
                      {authMode === 'register' && 'GENERATE ACCOUNT'}
                      {authMode === 'forgot' && 'LOST VERIFICATION'}
                      {authMode === 'reset' && 'OVERWRITE CODE'}
                    </span>
                    <span className="font-mono text-[8px] text-zinc-500 mt-1 uppercase tracking-widest">
                      {authMode === 'login' && 'SECURE SYSTEM KEY ENCRYPTION'}
                      {authMode === 'register' && 'MINT NEW IN_HUD AUTH RECORDS'}
                      {authMode === 'forgot' && 'REQUEST SEED KEY RECALL'}
                      {authMode === 'reset' && 'INPUT REGENERATED AUTH CODE'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowAuthDrawer(false);
                      setAuthError(null);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Form modules */}
                <div className="flex-1 overflow-y-auto py-6 space-y-5">
                  
                  {authError && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-[#FF3B30] flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="font-mono text-[10px] uppercase tracking-wider">{authError}</span>
                    </div>
                  )}

                  {authMode === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          required
                          placeholder="user@gmail.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">PASSPHRASE KEY</label>
                        <input
                          type="password"
                          required
                          placeholder="password123"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                          className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] pt-1 font-mono uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setAuthMode('register')}
                          className="text-zinc-400 hover:text-[#00E5FF] transition duration-200"
                        >
                          Generate Profiler
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot')}
                          className="text-zinc-500 hover:text-white transition duration-200"
                        >
                          Lost Key?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-display font-bold text-[9px] tracking-widest uppercase rounded-full transition duration-300"
                      >
                        {formLoading ? 'LINKING AVATAR...' : 'CONNECT PROFILE'}
                      </button>
                    </form>
                  )}

                  {authMode === 'register' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">AVATAR IDENTITY NAME</label>
                        <input
                          type="text"
                          required
                          placeholder="Kalvo Junikrosh"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">SYSTEM EMAIL</label>
                        <input
                          type="email"
                          required
                          placeholder="user@gmail.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">CHOSEN PASSPHRASE</label>
                        <input
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                          className="w-full bg-black/45 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300"
                        />
                      </div>
                      <div className="flex justify-start text-[10px] pt-1 font-mono uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="text-zinc-400 hover:text-[#00E5FF] transition duration-200"
                        >
                          Already have an avatar? Log-in
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-display font-bold text-[9px] tracking-widest uppercase rounded-full transition duration-300"
                      >
                        {formLoading ? 'GENERATING CORES...' : 'MINT AVATAR'}
                      </button>
                    </form>
                  )}

                  {authMode === 'forgot' && (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">ASSOCIATED RECOVERY EMAIL</label>
                        <input
                          type="email"
                          required
                          placeholder="user@gmail.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full bg-black/45 border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                        />
                      </div>

                      <div className="flex justify-between text-[10px] pt-1 font-mono uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="text-zinc-500 hover:text-white transition duration-200"
                        >
                          ← Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('reset')}
                          className="text-[#00E5FF] hover:underline transition duration-200"
                        >
                          Have Code? Overwrite
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-display text-[9px] font-bold tracking-widest uppercase rounded-full transition duration-300"
                      >
                        {formLoading ? 'DISPATCHING RECOVERY...' : 'REQUEST RECONSTRUCTION'}
                      </button>
                    </form>
                  )}

                  {authMode === 'reset' && (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">DISPATCH RECOVERY CODE</label>
                        <input
                          type="text"
                          required
                          placeholder="Input recovery token code from clipboard"
                          value={resetForm.token}
                          onChange={(e) => setResetForm((prev) => ({ ...prev, token: e.target.value }))}
                          className="w-full bg-black/45 border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-[#00E5FF]">NEW ENCRYPTED PASSPHRASE</label>
                        <input
                          type="password"
                          required
                          placeholder="Overriding keys"
                          value={resetForm.newPassword}
                          onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full bg-black/45 border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none transition-all duration-300"
                        />
                      </div>

                      <div className="flex justify-start text-[10px] pt-1 font-mono uppercase tracking-wider">
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="text-zinc-500 hover:text-white transition duration-200"
                        >
                          ← Cancel
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-display text-[9px] font-bold tracking-widest uppercase rounded-full transition duration-300"
                      >
                        {formLoading ? 'REBUILDING CREDENTIALS...' : 'COMMIT NEW PASSPHRASE'}
                      </button>
                    </form>
                  )}

                  {/* Google simulator connector */}
                  {(authMode === 'login' || authMode === 'register') && (
                    <div className="border-t border-white/5 pt-6 space-y-3.5">
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink mx-4 text-[8px] font-mono uppercase text-zinc-500 tracking-widest">OR SIMULATE OAUTH_CORES</span>
                        <div className="flex-grow border-t border-white/5"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleLoginSimulate}
                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-[9px] font-mono tracking-widest uppercase transition duration-300 flex items-center justify-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
                        GOOGLE SIGN-ON (SIMULATED)
                      </button>
                    </div>
                  )}

                </div>

                <div className="pt-6 border-t border-white/5 text-[8px] text-zinc-500 bg-[#08080a] -mx-8 -mb-8 p-6 rounded-b-[20px] font-mono tracking-widest uppercase text-center">
                  SECURITY CLEARANCE PROTOCOL_2568
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN ADD DROPS/PRODUCTS SCREEN */}
      <AnimatePresence>
        {showAdminPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminPanel(false)}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0a0a0c]/98 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="font-display font-medium text-xs text-white uppercase tracking-widest">
                    ADD DIGITAL SILHOUETTE
                  </h3>
                </div>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProductAdmin} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">SNEAKER TITLES</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VECTOR-X PULSE"
                    value={newProductForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/\s+/g, '-');
                      setNewProductForm((p) => ({ ...p, name, slug }));
                    }}
                    className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">VALUE (CR)</label>
                    <input
                      type="number"
                      required
                      placeholder="1200"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm((p) => ({ ...p, price: e.target.value }))}
                      className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">RETAIL VALUE (CR)</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={newProductForm.retailPrice}
                      onChange={(e) => setNewProductForm((p) => ({ ...p, retailPrice: e.target.value }))}
                      className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">CHOOSE CATEGORY</label>
                  <select
                    required
                    value={newProductForm.categoryId}
                    onChange={(e) => setNewProductForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all duration-300"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">BRAND LABEL</label>
                    <input
                      type="text"
                      required
                      placeholder="AETHERLABS"
                      value={newProductForm.brand}
                      onChange={(e) => setNewProductForm((p) => ({ ...p, brand: e.target.value }))}
                      className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">COLORWAY</label>
                    <input
                      type="text"
                      required
                      placeholder="Neon/Vanta"
                      value={newProductForm.colorway}
                      onChange={(e) => setNewProductForm((p) => ({ ...p, colorway: e.target.value }))}
                      className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">PREVIEW IMAGE URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newProductForm.image}
                    onChange={(e) => setNewProductForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase font-bold text-zinc-500 font-mono tracking-widest">DESCRIPTION SPECIFICATIONS</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Woven digital memory mesh outlines..."
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full bg-[#0a0a0c] border border-white/5 focus:border-[#00E5FF]/40 rounded-xl p-3 text-xs text-white focus:outline-none transition-all duration-300 font-sans"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isCryptoExclusive"
                    checked={newProductForm.isCryptoExclusive}
                    onChange={(e) => setNewProductForm((p) => ({ ...p, isCryptoExclusive: e.target.checked }))}
                    className="w-4 h-4 bg-black border border-white/10 rounded accent-[#00E5FF] cursor-pointer"
                  />
                  <label htmlFor="isCryptoExclusive" className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest cursor-pointer select-none">
                    GATED AS QUANTUM SPEC EXCLUSIVE
                  </label>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-4 bg-white hover:bg-zinc-200 font-display font-bold text-[9px] text-black tracking-widest uppercase rounded-full transition duration-300"
                  >
                    {formLoading ? 'COMMITING SPEC...' : 'COMMIT SILHOUETTE SPEC'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cyberpunk Footer bar */}
      <footer className="border-t border-white/5 bg-[#050507] py-16 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-zinc-500 space-y-3 font-mono uppercase tracking-widest">
          <p>SNIK CRYPTO OPERATIONAL GRID PROTOCOL // SECURE SEED RECORD</p>
          <p className="text-[9px] text-zinc-600">
            Node Express, PostgreSQL & React Frame System
          </p>
          <p className="text-[8px] text-[#00E5FF] font-semibold">
            © 2026 SNIK LABS INC. SECURE INTERACTION WORKSPACE.
          </p>
        </div>
      </footer>

    </div>
  );
}
