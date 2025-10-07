import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'No One Will Pay - Admin Dashboard',
  description: 'Admin dashboard for managing Bitcoin education platform',
  keywords: ['Bitcoin', 'Admin', 'Dashboard', 'Management'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-950">
          <header className="border-b border-gray-800 bg-black">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-bitcoin">Admin Dashboard</h1>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
