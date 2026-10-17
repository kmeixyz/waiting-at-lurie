function PlanetShape() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="29" fill="#f4c2d3" stroke="#b87b9a" strokeWidth="2.5"/>
    <path d="M27 34q8-11 19-10" fill="none" stroke="#ffe8ed" strokeWidth="5"/>
    <ellipse cx="50" cy="58" rx="43" ry="13" transform="rotate(-20 50 58)" fill="none" stroke="#b87b9a" strokeWidth="10"/>
    <ellipse cx="50" cy="58" rx="43" ry="13" transform="rotate(-20 50 58)" fill="none" stroke="#ffe0a2" strokeWidth="6"/>
    <path d="M25 45a26 26 0 0 1 50 0v9q-26 17-50 1Z" fill="#f4c2d3"/>
    <g fill="#614963"><circle cx="40" cy="46" r="3"/><circle cx="60" cy="46" r="3"/></g>
    <g fill="#e799b3"><ellipse cx="32" cy="53" rx="5" ry="3"/><ellipse cx="68" cy="53" rx="5" ry="3"/></g>
    <path d="M44 54q6 7 12 0" stroke="#614963" strokeWidth="2.5" fill="none"/>
  </g>
}

function MailShape() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <rect x="13" y="25" width="74" height="53" rx="12" fill="#fff8e9" stroke="#bd9a7c" strokeWidth="3"/>
    <path d="m17 29 29 23q4 3 8 0l29-23" stroke="#d6b39b" strokeWidth="3" fill="#ffe8c9"/>
    <circle cx="36" cy="61" r="3" fill="#694d60"/><circle cx="64" cy="61" r="3" fill="#694d60"/>
    <path d="M45 65q5 6 10 0" fill="none" stroke="#694d60" strokeWidth="2.5"/>
    <g fill="#efb0bd"><ellipse cx="27" cy="66" rx="5" ry="3"/><ellipse cx="73" cy="66" rx="5" ry="3"/></g>
    <path d="M50 43c-7-8-15 3 0 11 15-8 7-19 0-11Z" fill="#dc92af"/>
  </g>
}

export function PlanetFriend() {
  return <svg className="post-friend-art" viewBox="0 0 100 100" aria-hidden="true"><PlanetShape/></svg>
}

export function MailFriend() {
  return <svg className="post-friend-art" viewBox="0 0 100 100" aria-hidden="true"><MailShape/></svg>
}

export function PlanetPostArt() {
  return <svg viewBox="0 0 540 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="540" height="300" fill="#eee4f4"/>
    <circle cx="50" cy="269" r="91" fill="#dfd3ed"/>
    <circle cx="508" cy="13" r="110" fill="#f6e8ef"/>
    <path d="M0 268q36-36 69-9 24-38 58-7 29-12 47 18v30H0Zm379 32v-22q20-27 43-10 16-35 44-18 28-31 53-4 28-5 36 21v33Z" fill="#fff9ee"/>
    <path d="M112 195h82q29 0 29-29v-16q0-29 29-29h123" fill="none" stroke="#80aa9d" strokeWidth="28"/>
    <path d="M112 195h82q29 0 29-29v-16q0-29 29-29h123" fill="none" stroke="#b3dfcc" strokeWidth="20"/>
    <path d="M112 195h82q29 0 29-29v-16q0-29 29-29h123" fill="none" stroke="#f6fff2" strokeWidth="3" strokeDasharray="3 9" strokeLinecap="round"/>
    <g transform="translate(42 111) rotate(-10 70 70) scale(1.55)"><MailShape/></g>
    <g transform="translate(316 42) scale(1.65)"><PlanetShape/></g>
    {[[86,67,1],[290,59,.65],[286,225,.85],[454,222,.7]].map(([x,y,s],i)=><g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="m0-16 5 10 11 2-8 8 2 11L0 10l-10 5 2-11-8-8 11-2Z" fill="#ffda84" stroke="#c4a061" strokeWidth="1.5" strokeLinejoin="round"/>
    </g>)}
    <g fill="#fffaf4"><circle cx="168" cy="72" r="4"/><circle cx="339" cy="220" r="4"/><circle cx="490" cy="168" r="3"/><circle cx="55" cy="110" r="3"/></g>
    <path d="m177 248 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm61-172 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#bba6d0"/>
  </svg>
}
