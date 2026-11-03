import type { Metadata } from 'next';
import { WorldPage } from '@/ui/WorldPage';

export const metadata: Metadata = { title: 'Websites' };

export default function WebsitesPage() {
  return <WorldPage path="/websites" />;
}
