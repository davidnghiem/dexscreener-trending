import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DexScreener Trending Tokens',
  description: 'Extract token contract addresses from DexScreener trending tokens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
