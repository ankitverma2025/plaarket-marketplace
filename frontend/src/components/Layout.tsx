import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/utils/translations';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Language Switcher Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container-responsive">
          <div className="flex justify-center items-center py-2 space-x-3">
            <span className="text-xs text-gray-500 font-medium">Language:</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
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

            <div className="flex items-center space-x-4 justify-center flex-1">
              <Link
                href="/products"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {t('nav.products')}
              </Link>
              <Link
                href="/sellers"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {t('nav.sellers')}
              </Link>
              
              {isAuthenticated ? (
                <Link
                  href={`/dashboard/${user?.role?.toLowerCase()}`}
                  className="btn btn-primary"
                >
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <Link href="/auth/login" className="btn btn-ghost">
                  {t('nav.login')}
                </Link>
              )}
            </div>
            
            {/* Register button right-aligned */}
            {!isAuthenticated && (
              <div className="flex items-center">
                <Link href="/auth/register" className="btn btn-primary">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
