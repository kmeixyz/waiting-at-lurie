// A scalloped seal, like a sticker, built from alternating outer and inner points.
const seal = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2 - Math.PI / 2
  const radius = i % 2 ? 41 : 47
  return `${(70 + radius * Math.cos(angle)).toFixed(1)} ${(70 + radius * Math.sin(angle)).toFixed(1)}`
}).join(' L')

/** The finish-screen badge: the seal pops in, the check draws itself, confetti bursts around it. The seal wears the game's sticker color. */
export function DoneBadge({ gameId }: { gameId: string }) {
  return (
    <svg viewBox="0 0 140 140" className={`done-badge sticker-${gameId}`} aria-hidden="true">
      <g className="done-confetti">
        <circle cx="16" cy="40" r="5" fill="#f0a6b8" />
        <circle cx="126" cy="98" r="5" fill="#4cb7c9" />
        <circle cx="112" cy="16" r="3.5" fill="#8f86d8" />
        <path d="M22 108l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#f2c94c" />
        <path d="M118 30l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" fill="#f2c94c" />
        <rect x="28" y="10" width="11" height="6" rx="3" fill="#f4a261" transform="rotate(-30 33 13)" />
        <rect x="110" y="120" width="11" height="6" rx="3" fill="#8f86d8" transform="rotate(25 115 123)" />
        <path d="M6 76q4-6 8 0t8 0" fill="none" stroke="#4cb7c9" strokeWidth="3" strokeLinecap="round" />
        <path d="M120 64q4-6 8 0t8 0" fill="none" stroke="#f0a6b8" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="done-seal">
        <path className="done-seal-edge" d={`M${seal}Z`} strokeWidth="6" strokeLinejoin="round" />
        <circle className="done-seal-face" cx="70" cy="70" r="33" />
        <ellipse cx="56" cy="52" rx="12" ry="7" fill="white" opacity=".3" transform="rotate(-30 56 52)" />
        <path className="done-check" d="M53 71l12 12 23-25" fill="none" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
      </g>
    </svg>
  )
}
