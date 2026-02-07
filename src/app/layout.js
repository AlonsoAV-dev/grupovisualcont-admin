import './globals.css';

export const metadata = {
  title: 'Admin Panel - Grupo Visual',
  description: 'Panel de administración de Grupo Visual',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">{children}</body>
    </html>
  );
}
