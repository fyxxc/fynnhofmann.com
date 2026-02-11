import React from "react"
import type { Metadata, Viewport } from "next"
import { Sora, Space_Mono } from "next/font/google"

import "./globals.css"

const _sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const _spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "Digital Identity Hub",
  description:
    "A modern, minimal personal website and protected dashboard.",
}

export const viewport: Viewport = {
  themeColor: "#1f1f1f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
