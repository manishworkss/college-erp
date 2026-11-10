import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MKR College ERP | Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College',
  description: 'Enterprise Resource Planning & Academic Management System for M.K.R. Dr. G.R.D. College, Sitamarhi (Affiliated with B.R.A. Bihar University)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}

