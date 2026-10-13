import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FactoryLens - AI Production Loss & Operations Copilot',
  description: 'AI-powered production loss intelligence and operations copilot for food & beverage manufacturers. Turn factory data into the next best action.',
  openGraph: {
    title: 'FactoryLens - AI Production Loss & Operations Copilot',
    description: 'Turn factory data into the next best action. Detect production losses, understand root causes, and take action.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FactoryLens - AI Production Loss & Operations Copilot',
    description: 'Turn factory data into the next best action. Detect production losses, understand root causes, and take action.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-slate-900 bg-slate-50 selection:bg-amber-100 selection:text-amber-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
