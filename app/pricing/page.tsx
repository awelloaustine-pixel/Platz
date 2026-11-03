import type { Metadata } from 'next';
import { WorldPage } from '@/ui/WorldPage';

export const metadata: Metadata = { title: 'Pricing' };

export default function PricingPage() {
  return <WorldPage path="/pricing" />;
}
