export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: {
    products: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  retailPrice: number;
  image: string;
  gallery: string;
  sizes: string;
  stock: number;
  brand: string;
  colorway: string;
  releaseDate: string;
  isCryptoExclusive: boolean;
  categoryId: string;
  category: Category;
  reviews?: Review[];
  marketHistory?: { date: string; price: number; volume: number }[];
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size: string;
  product: Product;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  transactionId?: string;
  amount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  size: string;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
}

export interface VirtualDrop {
  id: string;
  name: string;
  releaseTime: string;
  price: number;
  image: string;
  brand: string;
  supply: number;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
}
