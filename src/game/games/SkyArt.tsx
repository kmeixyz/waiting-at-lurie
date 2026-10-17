/** The same little cloud bunny appears on the shelf and in the no-WebGL game. */
function Bunny() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cy="56" rx="69" ry="12" fill="#c5c1df" opacity=".4"/>
    <path d="M-63 46C-83 24-60 6-40 17-39-8-8-13 6 5 29-12 51 0 49 19 80 11 87 44 62 52Q0 67-63 46Z" fill="#fffefa" stroke="#d6c7e1" strokeWidth="3"/>
    <ellipse cy="5" rx="28" ry="36" fill="#fff1dc" stroke="#dfbfb0" strokeWidth="2.5"/>
    <ellipse cy="10" rx="17" ry="21" fill="#fffefa"/>
    <ellipse cx="-20" cy="32" rx="16" ry="10" fill="#fff1dc" stroke="#dfbfb0" strokeWidth="2"/>
    <ellipse cx="20" cy="32" rx="16" ry="10" fill="#fff1dc" stroke="#dfbfb0" strokeWidth="2"/>
    <path d="M-24-15Q0-5 23-16L26-5Q0 9-25-4Z" fill="#70bcaf"/>
    <path d="M18-5 33 18 43 9 26-13Z" fill="#70bcaf"/>
    <ellipse cx="-22" cy="-69" rx="13" ry="37" transform="rotate(-13 -22 -69)" fill="#fff1dc" stroke="#dfbfb0" strokeWidth="2.5"/>
    <ellipse cx="23" cy="-69" rx="13" ry="37" transform="rotate(13 23 -69)" fill="#fff1dc" stroke="#dfbfb0" strokeWidth="2.5"/>
    <ellipse cx="-23" cy="-72" rx="6" ry="24" transform="rotate(-13 -23 -72)" fill="#f2a9b8"/>
    <ellipse cx="24" cy="-72" rx="6" ry="24" transform="rotate(13 24 -72)" fill="#f2a9b8"/>
    <ellipse cy="-33" rx="40" ry="33" fill="#fff1dc" stroke="#dfbfb0" strokeWidth="2.5"/>
    <g fill="#f2afbd"><ellipse cx="-27" cy="-25" rx="8" ry="5"/><ellipse cx="27" cy="-25" rx="8" ry="5"/></g>
    <g fill="#493746"><ellipse cx="-14" cy="-36" rx="4.3" ry="6"/><ellipse cx="14" cy="-36" rx="4.3" ry="6"/></g>
    <g fill="#fff"><circle cx="-15" cy="-38" r="1.5"/><circle cx="13" cy="-38" r="1.5"/></g>
    <path d="M-4-27Q0-31 4-27L0-23Z" fill="#ca7d8d"/>
    <path d="M-9-21Q-4-15 0-22 4-15 9-21" fill="none" stroke="#79535a" strokeWidth="2"/>
    <ellipse cx="-30" cy="5" rx="9" ry="16" transform="rotate(-25 -30 5)" fill="#fff1dc"/>
    <ellipse cx="30" cy="5" rx="9" ry="16" transform="rotate(25 30 5)" fill="#fff1dc"/>
  </g>
}

export function SkyBunny() {
  return <svg viewBox="-85 -112 170 180" aria-hidden="true"><Bunny/></svg>
}

export function SkyCover({ crop = false }: { crop?: boolean }) {
  return <svg className="sky-cover" viewBox="0 0 540 300" preserveAspectRatio={crop ? 'xMidYMid slice' : 'xMidYMid meet'} aria-hidden="true">
    <rect width="540" height="300" fill="#d8edf0"/>
    <circle cx="454" cy="56" r="26" fill="#ffe2a1"/>
    <path d="M57 192A142 142 0 0 1 341 192" fill="none" stroke="#f0a9bc" strokeWidth="17"/>
    <path d="M75 192A124 124 0 0 1 323 192" fill="none" stroke="#ffda99" strokeWidth="17"/>
    <path d="M93 192A106 106 0 0 1 305 192" fill="none" stroke="#a9d4bd" strokeWidth="17"/>
    <path d="M111 192A88 88 0 0 1 287 192" fill="none" stroke="#c4b5e2" strokeWidth="17"/>
    <path d="M0 228Q122 193 243 227T540 216V300H0Z" fill="#e9dff0"/>
    <path d="M187 300Q358 229 296 170H336Q427 229 405 300" fill="#fff0d1" stroke="#f1b7c5" strokeWidth="6"/>
    <g fill="#fffdf7"><path d="M0 189Q-9 165 20 163 21 128 52 141 73 114 96 143 131 143 125 170 152 185 126 199H0Z"/><path d="M404 124Q394 102 417 97 420 68 449 83 471 64 487 88 517 80 523 104 552 108 540 129Z"/></g>
    <g transform="translate(263 207) scale(1.08)"><Bunny/></g>
    <g fill="#ffc94f" stroke="#d99b39" strokeWidth="2" strokeLinejoin="round"><path d="m378 157 15-20 15 20-15 22Z"/><path d="m432 209 19-24 19 24-19 28Z"/></g>
    <path d="m130 53 3 9 9 3-9 3-3 9-3-9-9-3 9-3ZM400 43l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#fffefa"/>
  </svg>
}
