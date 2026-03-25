import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata = {
  title: 'FuelSync AI — Smart CNG Pump Finder',
  description:
    'AI-powered CNG pump recommendation system. Find the nearest pump with the shortest wait time, real-time crowd data, and smart price insights across Delhi NCR.',
  keywords: ['CNG', 'pump finder', 'fuel', 'AI', 'India', 'Delhi NCR', 'gas station'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-fuel-dark font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
