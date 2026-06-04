import type { Metadata } from "next";
import { Quicksand, Pacifico } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-sans-cute",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const pacifico = Pacifico({
  variable: "--font-serif-romantic",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "For My Favorite Person 💖 Will you be mine forever?",
  description: "A cute, playful, and interactive romantic page made just for you. Will you say YES? 😍",
  authors: [{ name: "Antigravity Dev" }],
  openGraph: {
    title: "Will you be mine forever? 💖",
    description: "A playful, interactive love note. Try clicking no! 😉",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${pacifico.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-pink-300 selection:text-pink-900">
        {children}
      </body>
    </html>
  );
}
