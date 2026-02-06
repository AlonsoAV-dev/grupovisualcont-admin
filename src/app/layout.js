import './globals.css';

export const metadata = {
  title: 'Admin Panel - Grupo Visual',
  description: 'Panel de administración de Grupo Visual',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
