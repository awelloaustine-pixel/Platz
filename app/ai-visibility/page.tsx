import type { Metadata } from 'next';
import { WorldPage } from '@/ui/WorldPage';

export const metadata: Metadata = { title: 'AI Visibility' };

export default function AiVisibilityPage() {
  return <WorldPage path="/ai-visibility" />;
}
