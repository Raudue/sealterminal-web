import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SealTerminal — Multi-Terminal Manager',
  description:
    'A pixel-powered multi-terminal manager with tabs, profiles, and project workflows. Built for developers who live in the terminal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
