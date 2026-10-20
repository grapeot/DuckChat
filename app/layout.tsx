import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Brand typefaces (Superlinear Academy), vendored under app/fonts (SIL OFL 1.1, see app/fonts/OFL.txt).
// Nothing is fetched from Google Fonts at build or run time.
const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-opsz-normal.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/newsreader-latin-opsz-italic.woff2", weight: "200 800", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

const inter = localFont({
  src: [{ path: "./fonts/inter-latin-opsz-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
});

const outfit = localFont({
  src: [{ path: "./fonts/outfit-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    { path: "./fonts/jetbrains-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DuckChat · AI Builders",
  description: "A chat interface built on the AI Builder API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
