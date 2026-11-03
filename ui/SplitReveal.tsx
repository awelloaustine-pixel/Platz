import type { CSSProperties } from 'react';

/**
 * Letter-by-letter title. Built on the server as real text inside spans, so crawlers and
 * no-JS visitors get the words. Screen readers get the label, not individual letters.
 */
export function SplitReveal({ text }: { text: string }) {
  let letter = 0;
  return (
    <span aria-label={text} role="text">
      <span aria-hidden="true">
        {text.split(' ').map((word, wordIndex, words) => (
          <span key={wordIndex}>
            <span className="split-word">
              {Array.from(word).map((character, characterIndex) => {
                letter += 1;
                return (
                  <span key={characterIndex} className="split-char" style={{ '--i': letter } as CSSProperties}>
                    {character}
                  </span>
                );
              })}
            </span>
            {wordIndex < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </span>
  );
}
