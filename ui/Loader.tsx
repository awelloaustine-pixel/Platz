const STONES = Array.from({ length: 12 }, (_, index) => index);

/**
 * First-visit intro. Pure CSS, so it finishes on time even if JavaScript is slow, and it
 * never takes clicks. The inline script in the layout skips it for repeat visits in a
 * session, phones, slow connections, Save-Data and reduced motion.
 */
export function Loader() {
  return (
    <div aria-hidden="true" className="loader">
      <div className="loader-hub">
        {STONES.map((stone) => (
          <span key={stone} className="loader-stone" style={{ '--n': stone } as React.CSSProperties} />
        ))}
        <span className="loader-count" />
      </div>
      <p className="hud-text loader-line">PLATINUM CORE / NAIROBI / STATUS: ONLINE</p>
    </div>
  );
}
