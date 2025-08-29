import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { productsApi } from '@/shared/utils/api';
import { Product } from '@/shared/types';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params: any = {
          page: 1,
          limit: 20,
          sortBy,
        };

        if (searchTerm) {
          params.search = searchTerm;
        }

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const response = await productsApi.getProducts(params);
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  return (
    <>
      <Head>
        <title>Products - Plaarket</title>
        <meta name="description" content="Browse our selection of organic products" />
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
                  className="text-primary-600 font-medium"
                >
                  Products
                </Link>
                <Link
                  href="/sellers"
                  className="text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Sellers
                </Link>
                <Link
                  href="/rfq"
                  className="text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  RFQ
                </Link>
                <Link href="/auth/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-neutral-50 py-12">
          <div className="container-responsive">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-neutral-900 mb-4">
                Organic Products
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Discover premium organic products from verified suppliers and farmers.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </form>

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-5 h-5 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">Filters:</span>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-neutral-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="createdAt">Newest</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="py-12">
          <div className="container-responsive">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
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
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
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
                      <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
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
                      {product.stockQuantity > 0 ? (
                        <div className="mt-2 text-xs text-green-600">
                          {product.stockQuantity} in stock
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-red-600">
                          Out of stock
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No products found
                </h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}



