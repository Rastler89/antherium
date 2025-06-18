import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Antherium',
  description: 'Ten tu hormiguero digital',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es'>
      <head>
  <link href="/dist/styles.css" rel="stylesheet" />

      </head>
      <body>{children}</body>
    </html>
  )
}