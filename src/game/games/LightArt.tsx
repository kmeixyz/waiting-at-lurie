import type { Mirror } from './lightLabLogic'

/** Soft light friends for Light Lab, shared by the cover and the playable board. */
function Face({ y, awake = true, ink = '#634b5c' }: { y: number; awake?: boolean; ink?: string }) {
  return <g transform={`translate(0 ${y})`} strokeLinecap="round">
    {awake
      ? <g fill={ink}><circle cx="41" cy="0" r="3"/><circle cx="59" cy="0" r="3"/></g>
      : <path d="M37 0q4 3 8 0M55 0q4 3 8 0" fill="none" stroke={ink} strokeWidth="2.5"/>}
    <g fill="#f3a7b8" opacity=".8"><ellipse cx="33" cy="7" rx="4.5" ry="2.8"/><ellipse cx="67" cy="7" rx="4.5" ry="2.8"/></g>
    <path d={awake ? 'M45 7q5 5 10 0' : 'M47 8h6'} fill="none" stroke={ink} strokeWidth="2.5"/>
  </g>
}

function SunShape() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => <rect key={angle} x="45" y="2" width="10" height="17" rx="5" transform={`rotate(${angle} 50 50)`} fill="#ffcb6b" stroke="#d99d3d" strokeWidth="2.5"/>)}
    <circle cx="50" cy="50" r="28" fill="#ffd977" stroke="#d99d3d" strokeWidth="3"/>
    <path d="M32 40q5-10 15-12" fill="none" stroke="#fff3c8" strokeWidth="4"/>
    <Face y={52}/>
  </g>
}

function StarShape({ lit }: { lit: boolean }) {
  return <g strokeLinejoin="round">
    <path d="m50 8 12 26 29 4-21 21 5 30-25-14-25 14 5-30L9 38l29-4Z" fill={lit ? '#ffd56e' : '#f4eef8'} stroke={lit ? '#c99232' : '#b6a4c8'} strokeWidth="4"/>
    {lit && <path d="m42 26-6 14-13 2" fill="none" stroke="#fff4cb" strokeWidth="4" strokeLinecap="round"/>}
    <Face y={52} awake={lit} ink={lit ? '#6d4d37' : '#8a789a'}/>
  </g>
}

function BulbShape({ lit }: { lit: boolean }) {
  return <g strokeLinecap="round" strokeLinejoin="round">
    {lit && <circle cx="50" cy="40" r="44" fill="#ffe59a" opacity=".55"/>}
    <path d="M35 64q-13-9-13-25a28 28 0 0 1 56 0q0 16-13 25v6H35Z" fill={lit ? '#fff1b5' : '#f7f3fa'} stroke={lit ? '#d6a442' : '#b6a4c8'} strokeWidth="3"/>
    <path d="M32 30q4-10 13-13" fill="none" stroke="#fff" strokeWidth="4"/>
    <rect x="35" y="70" width="30" height="16" rx="5" fill="#d9dfe8" stroke="#9aa7b8" strokeWidth="3"/>
    <path d="M37 78h26" stroke="#9aa7b8" strokeWidth="2.5"/>
    <path d="M43 86v4h14v-4" fill="#b8c2cf" stroke="#9aa7b8" strokeWidth="2.5"/>
    <Face y={42} awake={lit}/>
  </g>
}

function MirrorShape({ mirror }: { mirror: Mirror }) {
  return <g transform={`rotate(${mirror === '/' ? -45 : 45} 50 50)`} strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="40" width="68" height="20" rx="10" fill="#a991c7" stroke="#7c66a0" strokeWidth="3"/>
    <rect x="22" y="44" width="56" height="12" rx="6" fill="#dff4fa"/>
    <path d="M29 48h20" stroke="#fff" strokeWidth="3"/>
  </g>
}

function WallShape() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <rect x="17" y="24" width="66" height="63" rx="15" fill="#c9b6dc" stroke="#8a74a6" strokeWidth="3"/>
    <rect x="17" y="16" width="66" height="61" rx="15" fill="#e6daf0" stroke="#8a74a6" strokeWidth="3"/>
    <path d="m39 36 22 22m0-22L39 58" stroke="#8a74a6" strokeWidth="7"/>
  </g>
}

export function LightSun() {
  return <svg className="light-friend-art" viewBox="0 0 100 100" aria-hidden="true"><SunShape/></svg>
}
export function LightStar({ lit }: { lit: boolean }) {
  return <svg className="light-friend-art" viewBox="0 0 100 100" aria-hidden="true"><StarShape lit={lit}/></svg>
}
export function LightBulb({ lit }: { lit: boolean }) {
  return <svg className="light-friend-art" viewBox="0 0 100 100" aria-hidden="true"><BulbShape lit={lit}/></svg>
}
export function LightMirror({ mirror }: { mirror: Mirror }) {
  return <svg className="light-mirror-glyph" viewBox="0 0 100 100" aria-hidden="true"><MirrorShape mirror={mirror}/></svg>
}
export function LightWall() {
  return <svg className="light-friend-art" viewBox="0 0 100 100" aria-hidden="true"><WallShape/></svg>
}

const coverBeam = 'M130 104H318V196H446'

export function LightLabCover({ crop = false }: { crop?: boolean }) {
  return <svg className="light-cover" viewBox="0 0 540 300" preserveAspectRatio={crop ? 'xMidYMid slice' : 'xMidYMid meet'} aria-hidden="true">
    {/* Sky and hills run far past the frame, so a letterboxed intro shows more of them, not a stripe. */}
    <rect x="-2000" y="-2000" width="4540" height="4300" fill="#fbefd9"/>
    <path d="M-2000 200H0Q140 168 270 196T540 200H2540V2300H-2000Z" fill="#eadff3"/>
    <path d="M-2000 236H0Q135 206 270 236T540 236H2540V2300H-2000Z" fill="#dccdee"/>
    <g fill="#fffdf7"><path d="M222 60q-7-16 12-20 5-23 26-11 20-16 32 6 23 0 22 25Z"/><path d="M408 76q-5-13 11-16 6-18 22-8 15-11 26 6 19 0 18 18Z"/></g>
    <path d={coverBeam} fill="none" stroke="#ffd36e" strokeWidth="20" strokeLinejoin="round" opacity=".45"/>
    <path d={coverBeam} fill="none" stroke="#f2ab3c" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
    <path d={coverBeam} fill="none" stroke="#fff8e4" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round"/>
    <g transform="translate(287 73) scale(.62)"><MirrorShape mirror={'\\'}/></g>
    <g transform="translate(287 165) scale(.62)"><MirrorShape mirror={'\\'}/></g>
    {[[215,104,.42],[318,150,.4],[384,196,.42]].map(([x,y,s],i)=><g key={i} transform={`translate(${x-50*s} ${y-52*s}) scale(${s})`}><StarShape lit/></g>)}
    <g transform="translate(418 154) scale(.95)"><BulbShape lit/></g>
    <g transform="translate(28 42) scale(1.25)"><SunShape/></g>
    {[[58,262,'#fff6e3'],[236,278,'#f6bccb'],[506,266,'#fff6e3']].map(([x,y,c],i)=><g key={i} transform={`translate(${x} ${y})`}>
      <path d="M0 2v14" stroke="#9d8ab8" strokeWidth="3" strokeLinecap="round"/>
      {[0,72,144,216,288].map(a=><ellipse key={a} cy="-7" rx="4.5" ry="7" transform={`rotate(${a})`} fill={c as string}/>)}
      <circle r="4.5" fill="#e5b657"/>
    </g>)}
    <path d="m392 120 3 9 9 3-9 3-3 9-3-9-9-3 9-3Zm-226 82 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm-30 34 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#c1afd6"/>
    <g fill="#fffaf2"><circle cx="186" cy="42" r="4"/><circle cx="512" cy="132" r="3"/><circle cx="262" cy="160" r="3"/></g>
  </svg>
}
