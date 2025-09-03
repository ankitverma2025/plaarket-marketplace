import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
