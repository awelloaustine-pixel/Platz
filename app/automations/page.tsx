import type { Metadata } from 'next';
import { WorldPage } from '@/ui/WorldPage';

export const metadata: Metadata = { title: 'WhatsApp Automations' };

export default function AutomationsPage() {
  return <WorldPage path="/automations" />;
}
