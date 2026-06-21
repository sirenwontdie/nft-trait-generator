import './globals.css';

export const metadata = {
  title: 'NFT Trait Generator',
  description: 'Local NFT trait generator - generate unique NFT collections',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-900 text-gray-200">
        {children}
      </body>
    </html>
  );
}
