import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ClipboardDocumentListIcon, 
  PlusIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { rfqApi } from '@/shared/utils/api';

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  budget?: number;
  location?: string;
  deliveryDate?: string;
  expiresAt: string;
  status: 'OPEN' | 'QUOTED' | 'CLOSED' | 'EXPIRED';
  createdAt: string;
  buyer: {
    id: string;
    email: string;
    buyerProfile?: {
      firstName: string;
      lastName: string;
      company?: string;
    };
  };
  category?: {
    id: string;
    name: string;
  };
  quotesCount?: number;
}

export default function RFQPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'my-rfqs'>('all');

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        setIsLoading(true);
        
        if (filter === 'my-rfqs' && isAuthenticated) {
          const response = await rfqApi.getMyRFQs({ status: 'OPEN' });
          if (response.success) {
            setRfqs(response.data || []);
          }
        } else {
          const response = await rfqApi.getRFQs({ 
            status: filter === 'all' ? undefined : 'OPEN',
            page: 1,
            limit: 20
          });
          if (response.success) {
            setRfqs(response.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch RFQs:', error);
        // Mock data for demonstration
        setRfqs([
          {
            id: '1',
            rfqNumber: 'RFQ-2024-001',
            title: 'Organic Tomatoes - Bulk Order',
            description: 'Looking for 1000kg of organic tomatoes for restaurant chain. Must be certified organic.',
            quantity: 1000,
            unit: 'kg',
            budget: 5000,
            location: 'New York, NY',
            deliveryDate: '2024-02-15',
            expiresAt: '2024-02-10',
            status: 'OPEN',
            createdAt: '2024-01-15',
            quotesCount: 3,
            buyer: {
              id: '1',
              email: 'buyer@example.com',
              buyerProfile: {
                firstName: 'John',
                lastName: 'Doe',
                company: 'Green Restaurant Group'
              }
            },
            category: {
              id: '1',
              name: 'Vegetables'
            }
          },
          {
            id: '2',
            rfqNumber: 'RFQ-2024-002',
            title: 'Organic Wheat Flour',
            description: 'Need 500 bags of organic wheat flour for bakery operations.',
            quantity: 500,
            unit: 'bags',
            budget: 3000,
            location: 'California, CA',
            deliveryDate: '2024-02-20',
            expiresAt: '2024-02-18',
            status: 'OPEN',
            createdAt: '2024-01-16',
            quotesCount: 1,
            buyer: {
              id: '2',
              email: 'buyer2@example.com',
              buyerProfile: {
                firstName: 'Jane',
                lastName: 'Smith',
                company: 'Artisan Bakery'
              }
            },
            category: {
              id: '2',
              name: 'Grains'
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRFQs();
  }, [filter, isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'QUOTED':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <>
      <Head>
        <title>Request for Quote (RFQ) - Plaarket</title>
        <meta name="description" content="Browse and create requests for quotes for organic products" />
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
                <Link
                  href="/rfq"
                  className="text-primary-600 font-medium"
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
                Request for Quote (RFQ)
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Connect with suppliers for bulk orders. Create RFQs to get competitive quotes from verified organic suppliers.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated && user?.role === 'BUYER' && (
                <Link
                  href="/rfq/create"
                  className="btn btn-primary btn-lg inline-flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New RFQ
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  href="/auth/register?role=buyer"
                  className="btn btn-primary btn-lg"
                >
                  Join as Buyer to Create RFQ
                </Link>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  All RFQs
                </button>
                <button
                  onClick={() => setFilter('open')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'open'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Open RFQs
                </button>
                {isAuthenticated && user?.role === 'BUYER' && (
                  <button
                    onClick={() => setFilter('my-rfqs')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === 'my-rfqs'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    My RFQs
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RFQs List */}
        <div className="py-12">
          <div className="container-responsive">
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="card-body">
                      <div className="h-4 bg-neutral-200 rounded mb-2 w-1/3"></div>
                      <div className="h-6 bg-neutral-200 rounded mb-4 w-2/3"></div>
                      <div className="h-3 bg-neutral-200 rounded mb-2 w-full"></div>
                      <div className="h-3 bg-neutral-200 rounded mb-4 w-3/4"></div>
                      <div className="flex space-x-4">
                        <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : rfqs.length > 0 ? (
              <div className="space-y-6">
                {rfqs.map((rfq) => (
                  <div key={rfq.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-mono text-neutral-500">
                              {rfq.rfqNumber}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                              {rfq.status}
                            </span>
                            {isExpired(rfq.expiresAt) && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            {rfq.title}
                          </h3>
                          <p className="text-neutral-600 mb-4 line-clamp-2">
                            {rfq.description}
                          </p>
                        </div>
                        {rfq.quotesCount && rfq.quotesCount > 0 && (
                          <div className="text-right">
                            <div className="text-sm text-neutral-500">Quotes</div>
                            <div className="text-lg font-semibold text-primary-600">
                              {rfq.quotesCount}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-neutral-600">
                          <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                          <span>{rfq.quantity} {rfq.unit}</span>
                        </div>
                        {rfq.budget && (
                          <div className="flex items-center text-sm text-neutral-600">
                            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                            <span>Budget: ${rfq.budget.toLocaleString()}</span>
                          </div>
                        )}
                        {rfq.location && (
                          <div className="flex items-center text-sm text-neutral-600">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            <span>{rfq.location}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-neutral-600">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          <span>Expires: {formatDate(rfq.expiresAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-neutral-500">
                          Posted by {rfq.buyer.buyerProfile 
                            ? `${rfq.buyer.buyerProfile.firstName} ${rfq.buyer.buyerProfile.lastName}`
                            : rfq.buyer.email
                          } on {formatDate(rfq.createdAt)}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/rfq/${rfq.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View Details
                          </Link>
                          {isAuthenticated && user?.role === 'SELLER' && rfq.status === 'OPEN' && !isExpired(rfq.expiresAt) && (
                            <Link
                              href={`/rfq/${rfq.id}/quote`}
                              className="btn btn-outline btn-sm"
                            >
                              Submit Quote
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No RFQs found
                </h3>
                <p className="text-neutral-600 mb-4">
                  {filter === 'my-rfqs' 
                    ? "You haven't created any RFQs yet."
                    : "No RFQs match your current filter."
                  }
                </p>
                {isAuthenticated && user?.role === 'BUYER' && (
                  <Link href="/rfq/create" className="btn btn-primary">
                    Create Your First RFQ
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}



