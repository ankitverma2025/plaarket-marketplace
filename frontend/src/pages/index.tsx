import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/shared/utils/api';
import { Product } from '@/shared/types';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsApi.getFeaturedProducts({ limit: 6 });
        if (response.success) {
          setFeaturedProducts(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect based on user role
      switch (user?.role) {
        case 'BUYER':
          router.push('/dashboard/buyer');
          break;
        case 'SELLER':
          router.push('/dashboard/seller');
          break;
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/products');
      }
    } else {
      router.push('/auth/register');
    }
  };

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified Organic Products',
      description: 'All products are verified for organic certification and quality standards.',
    },
    {
      icon: ClipboardDocumentListIcon,
      title: 'B2B RFQ System',
      description: 'Request quotes for bulk orders and connect directly with suppliers.',
    },
    {
      icon: ShoppingBagIcon,
      title: 'Easy B2C Shopping',
      description: 'Simple and secure shopping experience for individual consumers.',
    },
    {
      icon: TruckIcon,
      title: 'Direct from Farmers',
      description: 'Connect directly with organic farmers and verified suppliers.',
    },
    {
      icon: HeartIcon,
      title: 'Sustainable Practices',
      description: 'Supporting environmentally friendly and sustainable farming practices.',
    },
    {
      icon: SparklesIcon,
      title: 'Quality Assured',
      description: 'Rigorous quality checks and certification verification process.',
    },
  ];

  return (
    <>
      <Head>
        <title>Plaarket - Organic Products Marketplace</title>
        <meta
          name="description"
          content="Your trusted marketplace for organic products. Connect with verified organic farmers, suppliers, and brands for both B2B and B2C transactions."
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-neutral-200">
          <div className="container-responsive">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="font-heading font-bold text-xl text-neutral-900">
                    Plaarket
                  </span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/products"
                  className="text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/sellers"
                  className="text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Sellers
                </Link>
                {isAuthenticated ? (
                  <Link
                    href={`/dashboard/${user?.role?.toLowerCase()}`}
                    className="btn btn-primary"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login" className="btn btn-ghost">
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="btn btn-primary">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-primary-50 to-white">
          <div className="container-responsive">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-heading font-bold text-neutral-900 mb-6 text-balance">
                Your Trusted{' '}
                <span className="text-primary-600">Organic Products</span>{' '}
                Marketplace
              </h1>
              <p className="text-xl text-neutral-600 mb-8 text-pretty max-w-2xl mx-auto">
                Connect with verified organic farmers, suppliers, and brands. 
                Whether you're buying for your family or business, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
                  Get Started Today
                </button>
                <Link href="/products" className="btn btn-outline btn-lg">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container-responsive">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-neutral-900 mb-4">
                Why Choose Plaarket?
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                We provide a comprehensive platform for organic product trading with features designed for both businesses and consumers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl border border-neutral-200 hover:shadow-medium transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container-responsive">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-neutral-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Discover our latest selection of premium organic products from verified suppliers.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="card-body">
                      <div className="w-full h-48 bg-neutral-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded mb-4 w-3/4"></div>
                      <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="card card-hover"
                  >
                    <div className="card-body">
                      <div className="aspect-square bg-neutral-100 rounded-lg mb-4 overflow-hidden">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">
                        {product.shortDescription || product.description.substring(0, 100) + '...'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono font-semibold text-primary-600">
                          ${product.retailPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          per {product.unit}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-600">No featured products available at the moment.</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/products" className="btn btn-primary btn-lg">
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="container-responsive">
            <div className="text-center text-white">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of buyers and sellers who trust Plaarket for their organic product needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register?role=buyer" className="btn bg-white text-primary-600 hover:bg-neutral-100 btn-lg">
                  Start as Buyer
                </Link>
                <Link href="/auth/register?role=seller" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg">
                  Start as Seller
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white py-12">
          <div className="container-responsive">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="font-heading font-bold text-xl">Plaarket</span>
                </div>
                <p className="text-neutral-400">
                  Your trusted marketplace for organic products.
                </p>
              </div>
              
              <div>
                <h3 className="font-heading font-semibold mb-4">Products</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li><Link href="/products" className="hover:text-white transition-colors">Browse Products</Link></li>
                  <li><Link href="/products?category=fruits" className="hover:text-white transition-colors">Fruits</Link></li>
                  <li><Link href="/products?category=vegetables" className="hover:text-white transition-colors">Vegetables</Link></li>
                  <li><Link href="/products?category=grains" className="hover:text-white transition-colors">Grains</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-heading font-semibold mb-4">For Business</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li><Link href="/rfq" className="hover:text-white transition-colors">Request Quotes</Link></li>
                  <li><Link href="/sellers" className="hover:text-white transition-colors">Find Suppliers</Link></li>
                  <li><Link href="/auth/register?role=seller" className="hover:text-white transition-colors">Become a Seller</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-heading font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
              <p>&copy; 2024 Plaarket. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
