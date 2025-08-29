import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['BUYER', 'SELLER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const register = useAuthStore((state) => state.register);

  // Get role from URL query parameter
  useEffect(() => {
    const { role } = router.query;
    if (role === 'buyer' || role === 'seller') {
      setSelectedRole(role.toUpperCase() as 'BUYER' | 'SELLER');
    }
  }, [router.query]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: selectedRole,
    },
  });

  // Update form when role changes
  useEffect(() => {
    setValue('role', selectedRole);
  }, [selectedRole, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      await register({
        email: data.email,
        password: data.password,
        role: data.role,
      });
      
      if (data.role === 'SELLER') {
        toast.success('Registration successful! Your account is pending approval.');
      } else {
        toast.success('Registration successful! Welcome to Plaarket.');
      }
      
      // Redirect to appropriate dashboard
      if (data.role === 'BUYER') {
        router.push('/dashboard/buyer');
      } else {
        router.push('/auth/login?message=pending-approval');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account - Plaarket</title>
        <meta name="description" content="Create your Plaarket account" />
      </Head>

      <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-heading font-bold text-2xl text-neutral-900">
                Plaarket
              </span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-heading font-bold text-neutral-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Or{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('BUYER')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedRole === 'BUYER'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <div className="font-medium">Buyer</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Purchase organic products
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('SELLER')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedRole === 'SELLER'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <div className="font-medium">Seller</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Sell organic products
                  </div>
                </button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" {...registerField('role')} />

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...registerField('email')}
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerField('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-neutral-400" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerField('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-neutral-400" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {selectedRole === 'SELLER' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Seller Account Approval
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Seller accounts require approval before you can start selling. 
                          We'll review your application and notify you via email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



