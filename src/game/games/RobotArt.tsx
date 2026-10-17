/** A soft toy robot and its garden, shared by the cover and playable map. */
function RobotFriend() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="50" cy="91" rx="30" ry="5" fill="#c6bbd7" opacity=".45"/>
    <path d="M50 19V10" stroke="#799f99" strokeWidth="4"/>
    <circle cx="50" cy="8" r="5" fill="#edb2c4" stroke="#bf8097" strokeWidth="2"/>
    <rect x="31" y="57" width="38" height="29" rx="13" fill="#a8d9c9" stroke="#719b90" strokeWidth="2"/>
    <rect x="29" y="79" width="17" height="12" rx="6" fill="#fff1db" stroke="#c6ae94" strokeWidth="2"/>
    <rect x="54" y="79" width="17" height="12" rx="6" fill="#fff1db" stroke="#c6ae94" strokeWidth="2"/>
    <path d="M31 66 23 77M69 65 78 55" stroke="#719b90" strokeWidth="10"/>
    <circle cx="22" cy="78" r="7" fill="#fff1db" stroke="#c6ae94" strokeWidth="2"/>
    <circle cx="79" cy="53" r="7" fill="#fff1db" stroke="#c6ae94" strokeWidth="2"/>
    <circle cx="24" cy="26" r="10" fill="#fff1db" stroke="#c6ae94" strokeWidth="2"/>
    <circle cx="76" cy="26" r="10" fill="#fff1db" stroke="#c6ae94" strokeWidth="2"/>
    <circle cx="24" cy="26" r="5" fill="#edb2c4"/>
    <circle cx="76" cy="26" r="5" fill="#edb2c4"/>
    <rect x="17" y="22" width="66" height="41" rx="19" fill="#fff1db" stroke="#c6ae94" strokeWidth="2"/>
    <rect x="25" y="30" width="50" height="27" rx="12" fill="#655773"/>
    <path d="M34 42q4-7 8 0M58 42q4-7 8 0" fill="none" stroke="#fff5dc" strokeWidth="3"/>
    <ellipse cx="33" cy="48" rx="4" ry="2.5" fill="#efadbd"/>
    <ellipse cx="67" cy="48" rx="4" ry="2.5" fill="#efadbd"/>
    <path d="M46 48q4 5 8 0" fill="none" stroke="#fff5dc" strokeWidth="2"/>
    <path d="M50 68c-7-7-13 3 0 10 13-7 7-17 0-10Z" fill="#fff7e8"/>
  </g>
}

function StarFriend() {
  return <g strokeLinejoin="round">
    <path d="m50 8 12 26 29 4-21 21 5 30-25-14-25 14 5-30L9 38l29-4Z" fill="#ffda78" stroke="#c79436" strokeWidth="4"/>
    <path d="m42 26-6 14-13 2" fill="none" stroke="#fff4cb" strokeWidth="4" strokeLinecap="round"/>
    <g fill="#705039"><circle cx="40" cy="51" r="3"/><circle cx="60" cy="51" r="3"/></g>
    <path d="M44 59q6 6 12 0" fill="none" stroke="#705039" strokeWidth="3" strokeLinecap="round"/>
  </g>
}

function RobotHomeShape() {
  return <g strokeLinejoin="round" strokeLinecap="round">
    <rect x="21" y="40" width="58" height="48" rx="9" fill="#fff0d5" stroke="#b69d7c" strokeWidth="3"/>
    <path d="M12 43 50 12 88 43Z" fill="#efaec2" stroke="#b97d99" strokeWidth="4"/>
    <path d="M39 88V68a11 11 0 0 1 22 0v20" fill="#9ccfbd" stroke="#639888" strokeWidth="3"/>
    <circle cx="54" cy="74" r="2" fill="#507669"/>
    <circle cx="50" cy="40" r="8" fill="#fffaf0" stroke="#b97d99" strokeWidth="2"/>
    <path d="M46 40h8m-4-4v8" stroke="#b97d99" strokeWidth="2"/>
  </g>
}

export function RobotAvatar() {
  return <svg className="robot-friend-art" viewBox="0 0 100 100" aria-hidden="true"><RobotFriend/></svg>
}
export function RobotStar() {
  return <svg className="robot-star-art" viewBox="0 0 100 100" aria-hidden="true"><StarFriend/></svg>
}
export function RobotHome() {
  return <svg className="robot-home-art" viewBox="0 0 100 100" aria-hidden="true"><RobotHomeShape/></svg>
}
export function RobotBlock() {
  return <svg className="robot-block-art" viewBox="0 0 100 100" aria-hidden="true">
    <rect x="17" y="22" width="66" height="65" rx="15" fill="#b4a1c9" stroke="#806c98" strokeWidth="3"/>
    <rect x="17" y="15" width="66" height="62" rx="15" fill="#d7c7e5" stroke="#806c98" strokeWidth="3"/>
    <path d="m39 36 22 22m0-22L39 58" stroke="#806c98" strokeWidth="7" strokeLinecap="round"/>
  </svg>
}

export function RobotCover({ crop = false }: { crop?: boolean }) {
  return <svg className="robot-cover" viewBox="0 0 540 300" preserveAspectRatio={crop ? 'xMidYMid slice' : 'xMidYMid meet'} aria-hidden="true">
    <rect width="540" height="300" fill="#f9eddf"/>
    <circle cx="89" cy="61" r="29" fill="#ffe0a1"/>
    <path d="M0 173Q120 111 262 167T540 145V300H0Z" fill="#d5e8d7"/>
    <path d="M0 244Q130 183 256 226T540 205V300H0Z" fill="#bedbc8"/>
    <g fill="#fffdf7"><path d="M130 63q-7-16 12-20 5-24 26-11 20-16 32 6 23 0 22 25Z"/><path d="M330 48q-5-14 12-17 6-19 23-8 16-12 27 6 20 0 19 19Z"/></g>
    <g transform="translate(380 67) scale(1.15)"><RobotHomeShape/></g>
    {/* Rounded stepping stones give the same route motif as the playable board. */}
    {[[72,248],[152,232],[232,211],[310,188],[378,166]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}>
      <rect width="70" height="28" rx="10" fill={i%2?'#9fbfb4':'#b9a6ca'}/>
      <rect y="-8" width="70" height="28" rx="10" fill={i%2?'#e4f3e9':'#eee0f4'} stroke={i%2?'#91b2a3':'#b6a0c8'} strokeWidth="2"/>
    </g>)}
    <g transform="translate(139 76) scale(1.65)"><RobotFriend/></g>
    <g transform="translate(78 191) scale(.49)"><StarFriend/></g>
    <g transform="translate(321 130) scale(.43)"><StarFriend/></g>
    <g transform="translate(395 111) scale(.34)"><StarFriend/></g>
    <g stroke="#719f84" strokeWidth="4" strokeLinecap="round"><path d="M53 223v-36m433 72v-31m59-15v-35"/></g>
    {[[53,183],[433,225],[492,174]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}>
      {[0,72,144,216,288].map(a=><ellipse key={a} cy="-8" rx="5" ry="8" transform={`rotate(${a})`} fill={i===1?'#f1b8c9':'#fff6e3'}/>)}
      <circle r="5" fill="#e5b657"/>
    </g>)}
    <path d="m294 65 3 9 9 3-9 3-3 9-3-9-9-3 9-3Zm182 23 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#c1afcf"/>
  </svg>
}
