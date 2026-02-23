import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CookieConsent from '@/components/CookieConsent';

export const metadata = {
  title: 'Craftcake — Мастерская десертов',
  description: 'Авторские торты, макаронс, десерты и моти в Москве. Доставка по Москве и МО.',
  keywords: 'торты на заказ, макаронс, десерты, моти, кондитерская москва, craftcake',
  openGraph: {
    title: 'Craftcake — Мастерская десертов',
    description: 'Авторские торты, макаронс, десерты и моти в Москве',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          <Header />
          <CartSidebar />
          <main style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
