import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Avizio — Boostez vos avis Google automatiquement',
  description: 'Collectez automatiquement les avis de vos clients satisfaits et protégez votre réputation en ligne.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-800 antialiased">{children}</body>
    </html>
  );
}
