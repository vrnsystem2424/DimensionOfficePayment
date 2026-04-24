import './globals.css';
import Providers from "./providers";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex-1 w-full overflow-x-hidden">
        <Providers >{children}</Providers>
      </body>
    </html>
  );
}