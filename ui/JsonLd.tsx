import { serialiseJsonLd } from '@/lib/schema';

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(data) }} />;
}
