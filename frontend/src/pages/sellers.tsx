import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MagnifyingGlassIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { usersApi } from '@/shared/utils/api';

interface Seller {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  location?: string;
  description?: string;
  isVerified: boolean;
  categories: Array<{
    id: string;
    name: string;
  }>;
  user: {
    id: string;
    email: string;
  };
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setIsLoading(true);
        // Note: This would need to be implemented in the backend
        // For now, we'll use a mock response
        const response = await usersApi.getPublicSellerProfile('mock');
        // Mock data for demonstration
        setSellers([
          {
            id: '1',
            companyName: 'Green Valley Farms',
            contactPerson: 'John Smith',
            email: 'john@greenvalley.com',
            phone: '+1 (555) 123-4567',
            location: 'California, USA',
            description: 'Family-owned organic farm specializing in fresh vegetables and fruits.',
            isVerified: true,
            categories: [
              { id: '1', name: 'Vegetables' },
              { id: '2', name: 'Fruits' }
            ],
            user: {
              id: '1',
              email: 'john@greenvalley.com'
            }
          },
          {
            id: '2',
            companyName: 'Mountain Organic Co.',
            contactPerson: 'Sarah Johnson',
            email: 'sarah@mountainorganic.com',
            phone: '+1 (555) 987-6543',
            location: 'Colorado, USA',
            description: 'Premium organic grains and dairy products from the Rocky Mountains.',
            isVerified: true,
            categories: [
              { id: '3', name: 'Grains' },
              { id: '4', name: 'Dairy' }
            ],
            user: {
              id: '2',
              email: 'sarah@mountainorganic.com'
            }
          },
          {
            id: '3',
            companyName: 'Coastal Organics',
            contactPerson: 'Mike Davis',
            email: 'mike@coastalorganics.com',
            location: 'Oregon, USA',
            description: 'Sustainable seafood and coastal organic products.',
            isVerified: false,
            categories: [
              { id: '5', name: 'Seafood' }
            ],
            user: {
              id: '3',
              email: 'mike@coastalorganics.com'
            }
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch sellers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
                           seller.categories.some(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Sellers - Plaarket</title>
        <meta name="description" content="Find verified organic product sellers and suppliers" />
      </Head>

      <div className="min-h-screen bg-white">


        {/* Header */}
        <div className="bg-neutral-50 py-12">
          <div className="container-responsive">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-neutral-900 mb-4">
                Verified Sellers
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Connect with trusted organic farmers, suppliers, and brands. All sellers are verified for quality and authenticity.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <form className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search sellers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </form>

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-neutral-700">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                    <option value="seafood">Seafood</option>
                  </select>
                </div>

                <div className="text-sm text-neutral-600">
                  {filteredSellers.length} seller{filteredSellers.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="py-12">
          <div className="container-responsive">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="card-body">
                      <div className="w-full h-32 bg-neutral-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded mb-4 w-3/4"></div>
                      <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSellers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSellers.map((seller) => (
                  <div key={seller.id} className="card card-hover">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-xl">
                            {seller.companyName.charAt(0)}
                          </span>
                        </div>
                        {seller.isVerified && (
                          <div className="flex items-center text-green-600">
                            <CheckBadgeIcon className="w-5 h-5 mr-1" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {seller.companyName}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        Contact: {seller.contactPerson}
                      </p>
                      {seller.location && (
                        <p className="text-sm text-neutral-500 mb-3">
                          📍 {seller.location}
                        </p>
                      )}
                      
                      {seller.description && (
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                          {seller.description}
                        </p>
                      )}

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {seller.categories.map((category) => (
                            <span
                              key={category.id}
                              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          href={`/sellers/${seller.id}`}
                          className="flex-1 btn btn-primary btn-sm"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/rfq?seller=${seller.id}`}
                          className="flex-1 btn btn-outline btn-sm"
                        >
                          Request Quote
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No sellers found
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

        {/* CTA Section */}
        <div className="bg-primary-600 py-12">
          <div className="container-responsive">
            <div className="text-center text-white">
              <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-4">
                Want to become a seller?
              </h2>
              <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
                Join our marketplace and connect with buyers looking for organic products.
              </p>
              <Link
                href="/auth/register?role=seller"
                className="btn bg-white text-primary-600 hover:bg-neutral-100 btn-lg"
              >
                Apply to Sell
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



