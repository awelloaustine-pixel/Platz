import type { Metadata } from 'next';
import { WorldPage } from '@/ui/WorldPage';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return <WorldPage path="/contact" />;
}
