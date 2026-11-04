'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { demoAreas, demoTrades } from '@/content/services';
import { ui } from '@/timeline/store';

/**
 * Builds a sample question. Nothing is sent to any AI: it shows the kind of question
 * customers ask, then carries the choices over to the contact form.
 */
export function OracleDemo() {
  const [trade, setTrade] = useState<string>(demoTrades[0]);
  const [area, setArea] = useState<string>(demoAreas[0]);
  const question = `Who's the best ${trade} in ${area}?`;
  const query = new URLSearchParams({ trade, area }).toString();

  useEffect(() => {
    ui.set({ oracleQuestion: question });
  }, [question]);

  return (
    <div className="reveal">
      <div className="glass glass-card oracle-demo">
        <div className="oracle-fields">
          <label>
            <span className="hud-text text-white/85">Your trade</span>
            <select value={trade} onChange={(event) => setTrade(event.target.value)}>
              {demoTrades.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="hud-text text-white/85">Your area</span>
            <select value={area} onChange={(event) => setArea(event.target.value)}>
              {demoAreas.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="oracle-question" aria-live="polite">
          {question}
        </p>
        <p className="hud-text mt-3 text-white/80">Demo only. This is a sample question, not a live AI answer.</p>
        <Link href={`/contact?${query}`} className="btn-gold mt-4">
          Check my business for real →
        </Link>
      </div>
    </div>
  );
}
