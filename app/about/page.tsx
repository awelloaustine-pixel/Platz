import type { Metadata } from 'next';
import { WorldPage } from '@/ui/WorldPage';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return <WorldPage path="/about" />;
}
