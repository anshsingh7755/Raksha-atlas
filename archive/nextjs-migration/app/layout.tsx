import type { Metadata } from "next";
import "../../src/styles.css";

export const metadata: Metadata = {
  title: "Raksha Atlas | Open-source defence intelligence",
  description: "Open-source Indian defence information and news intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
