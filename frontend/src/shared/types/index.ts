// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  buyerProfile?: BuyerProfile;
  sellerProfile?: SellerProfile;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  description?: string;
  website?: string;
  establishedYear?: number;
  employeeCount?: string;
  businessLicense?: string;
  taxId?: string;
  isVerified: boolean;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
  categories?: SellerCategory[];
}

export interface SellerCategory {
  id: string;
  sellerId: string;
  categoryId: string;
  category: Category;
}

// Product Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  retailPrice: number;
  wholesalePrice?: number;
  minOrderQuantity: number;
  unit: string;
  stockQuantity: number;
  isActive: boolean;
  images: string[];
  tags: string[];
  nutritionInfo?: any;
  storageInfo?: string;
  shelfLife?: string;
  origin?: string;
  harvestDate?: string;
  isOrganic: boolean;
  isFairTrade: boolean;
  isGmoFree: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  seller?: SellerProfile;
  certifications?: ProductCertification[];
}

export interface ProductCertification {
  id: string;
  productId: string;
  certificationId: string;
  certification: Certification;
}

// Cart and Order Types
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  itemTotal?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  buyer?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isWholesale: boolean;
  product?: Product;
}

export interface Address {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// RFQ Types
export interface RFQ {
  id: string;
  rfqNumber: string;
  buyerId: string;
  title: string;
  description: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  budget?: number;
  location?: string;
  deliveryDate?: string;
  status: 'OPEN' | 'QUOTED' | 'CLOSED' | 'EXPIRED';
  expiresAt: string;
  requirements?: any;
  createdAt: string;
  updatedAt: string;
  buyer?: User;
  quotes?: Quote[];
  _count?: {
    quotes: number;
  };
}

export interface Quote {
  id: string;
  rfqId: string;
  sellerId: string;
  price: number;
  quantity: number;
  unit: string;
  deliveryTime?: string;
  terms?: string;
  notes?: string;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: SellerProfile;
  rfq?: RFQ;
}

// Certification Types
export interface Certification {
  id: string;
  userId: string;
  name: string;
  description?: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  products?: ProductCertification[];
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'RFQ_RECEIVED' | 'QUOTE_RECEIVED' | 'ORDER_STATUS' | 'CERTIFICATION_UPDATE' | 'GENERAL';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  role: 'BUYER' | 'SELLER';
}

export interface BuyerProfileForm {
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyType?: string;
}

export interface SellerProfileForm {
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  description?: string;
  website?: string;
  establishedYear?: number;
  employeeCount?: string;
  businessLicense?: string;
  taxId?: string;
  categories: string[];
}

export interface ProductForm {
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  sku: string;
  retailPrice: number;
  wholesalePrice?: number;
  minOrderQuantity: number;
  unit: string;
  stockQuantity: number;
  tags: string[];
  nutritionInfo?: any;
  storageInfo?: string;
  shelfLife?: string;
  origin?: string;
  harvestDate?: string;
  isOrganic: boolean;
  isFairTrade: boolean;
  isGmoFree: boolean;
}

export interface RFQForm {
  title: string;
  description: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  budget?: number;
  location?: string;
  deliveryDate?: string;
  expiresAt: string;
  requirements?: any;
}

export interface QuoteForm {
  price: number;
  quantity: number;
  unit: string;
  deliveryTime?: string;
  terms?: string;
  notes?: string;
}

export interface CertificationForm {
  name: string;
  description?: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl: string;
}

// Filter and Search Types
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isFairTrade?: boolean;
  isGmoFree?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sellerId?: string;
}

export interface RFQFilters {
  status?: string;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  summary: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
  };
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}
