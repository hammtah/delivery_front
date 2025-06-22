import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Driver Delivery App",
//   description: "A delivery driver application for managing deliveries",
//   manifest: "/manifest.json",
//     themeColor: "#000000",
//     viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"

//   appleWebApp: {
//     capable: true,
//     statusBarStyle: "default",
//     title: "Driver App",
//   },
//   formatDetection: {
//     telephone: false,
//   },
// };
  

export const metadata = {
    title: "Driver Delivery App",
    description: "A delivery driver application for managing deliveries",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Driver App",
    },
    formatDetection: {
      telephone: false,
    },
  };
  
  // themeColor and viewport must be declared separately
  export const viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: "no",
  };



export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Driver App" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
