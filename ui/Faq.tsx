import type { Faq as FaqItem } from '@/content/faqs';

/** Native disclosure elements, so the answers open with or without JavaScript. */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="reveal">
      <div className="faq-list">
        {items.map((item) => (
          <details key={item.question} className="glass faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
