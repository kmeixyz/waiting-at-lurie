export const postcardScenes = ['Whale', 'Rocket', 'Treehouse'] as const
export type PostcardScene = typeof postcardScenes[number]
export type PieceCount = 4 | 6

export function piecePosition(index: number, count: PieceCount) {
  const columns = count / 2
  const row = index < columns ? 'top' : 'bottom'
  const column = columns === 2 ? ['left', 'right'][index % columns] : ['left', 'middle', 'right'][index % columns]
  return `${row} ${column}`
}

function PostcardDrawing({ scene }: { scene: PostcardScene }) {
  if (scene === 'Whale') return <g>
    <path fill="#d9eef3" d="M0 0h360v270H0z"/>
    <circle cx="294" cy="45" r="25" fill="#ffdc83"/>
    <path d="M0 102q45-25 90 0t90 0 90 0 90 0v168H0Z" fill="#a7d9dd"/>
    <path d="M0 186q45-20 90 0t90 0 90 0 90 0v84H0Z" fill="#7fbbc7"/>
    <path d="M74 157q-5-68 78-68 64 0 78 58 26-25 48-17-8 31-35 40-21 41-84 42-68 0-85-55Z" fill="#477cab"/>
    <path d="M95 173q49 24 112-1-13 27-54 27-45 0-58-26" fill="#dcecf0"/>
    <circle cx="106" cy="143" r="6" fill="#24354b"/><path d="M99 156q8 7 16 0" fill="none" stroke="#24354b" strokeWidth="3" strokeLinecap="round"/>
    <path d="M147 90V69m0 0q-16-19-27-3m27 3q13-22 27-6" stroke="#477cab" strokeWidth="6" strokeLinecap="round" fill="none"/>
    <g fill="#f2b371"><path d="m34 230 9-19 9 19 21 3-16 14 3 21-17-10-18 10 4-21-16-14Z"/><path d="m290 206 15-10v22Z"/><ellipse cx="320" cy="207" rx="23" ry="13"/></g>
    <circle cx="330" cy="204" r="3" fill="#24354b"/>
    <g stroke="#ecfbff" strokeWidth="3" fill="none"><circle cx="308" cy="84" r="9"/><circle cx="284" cy="110" r="5"/><circle cx="45" cy="146" r="8"/></g>
    <path d="M244 270q-18-30 0-49m13 49q17-43 6-57" stroke="#477d70" strokeWidth="7" fill="none" strokeLinecap="round"/>
  </g>
  if (scene === 'Rocket') return <g>
    <path fill="#374b74" d="M0 0h360v270H0z"/>
    <g fill="#f7dfa0">{[[40,35],[94,89],[290,64],[320,144],[61,159],[239,24]].map(([x,y],i)=><path key={i} d={`M${x} ${y!-7}l3 5 6 2-6 3-3 6-3-6-6-3 6-2Z`}/>)}</g>
    <circle cx="303" cy="34" r="14" fill="#d8b9e4"/>
    <path d="M0 229Q140 161 360 222V270H0Z" fill="#d4cee8"/>
    <ellipse cx="63" cy="242" rx="24" ry="8" fill="#b1a9cf"/><ellipse cx="302" cy="240" rx="32" ry="10" fill="#b1a9cf"/>
    <path d="M151 157q-25 11-25 52l32-16M209 157q25 11 25 52l-32-16" fill="#e99f88"/>
    <path d="M155 181q-16-89 25-138 41 49 25 138Z" fill="#fff3dc"/>
    <path d="M158 81q8-24 22-38 14 14 22 38Z" fill="#e99f88"/>
    <circle cx="180" cy="119" r="23" fill="#8fcfda" stroke="#526d93" strokeWidth="5"/>
    <circle cx="172" cy="117" r="3" fill="#293d55"/><circle cx="188" cy="117" r="3" fill="#293d55"/><path d="M174 127q6 6 12 0" stroke="#293d55" strokeWidth="3" fill="none"/>
    <path d="M168 183q-6 24 12 37 18-13 12-37" fill="#f6c862"/>
    <path d="M246 226h36l9 25h-55Z" fill="#f4b59b"/><path d="M248 227q15-25 30 0" stroke="#76576d" strokeWidth="4" fill="none"/>
  </g>
  return <g>
    <path fill="#e6f0d8" d="M0 0h360v270H0z"/>
    <circle cx="59" cy="48" r="24" fill="#f6d889"/>
    <path d="M0 223Q150 182 360 225V270H0Z" fill="#b8d1a5"/>
    <path d="M160 103h39l9 167h-56Z" fill="#9d7355"/>
    <g fill="#75a078"><circle cx="129" cy="79" r="55"/><circle cx="204" cy="73" r="61"/><circle cx="249" cy="120" r="44"/><circle cx="96" cy="131" r="45"/></g>
    <path d="M112 122h139v85H112Z" fill="#e7b474"/><path d="m94 123 88-69 88 69Z" fill="#b96156"/>
    <path d="M171 153h28v54h-28Z" fill="#785746"/><rect x="126" y="146" width="28" height="30" rx="4" fill="#d4f0ef" stroke="#98724e" strokeWidth="3"/>
    <path d="M140 147v28m-13-14h26M228 215v55m-23-55v55m0-42h23m-23 16h23m-23 16h23" stroke="#8b684d" strokeWidth="4"/>
    <path d="M110 206h145" stroke="#80563d" strokeWidth="9" strokeLinecap="round"/>
    <g fill="#f2a8b7"><circle cx="52" cy="234" r="10"/><circle cx="310" cy="240" r="11"/></g><g fill="#ffefb9"><circle cx="52" cy="234" r="4"/><circle cx="310" cy="240" r="4"/></g>
    <path d="M274 46q8-11 16 0 8-11 16 0" fill="none" stroke="#587460" strokeWidth="3" strokeLinecap="round"/>
  </g>
}

export function PostcardArt({ scene = 'Whale', piece, count = 4, decorative = false, crop = false }: { scene?: PostcardScene; piece?: number; count?: PieceCount; decorative?: boolean; crop?: boolean }) {
  const columns = count / 2
  const width = 360 / columns
  const viewBox = piece === undefined ? '0 0 360 270' : `${piece % columns * width} ${Math.floor(piece / columns) * 135} ${width} 135`
  return <svg className="postcard-art" viewBox={viewBox} preserveAspectRatio={crop ? 'xMidYMid slice' : 'xMidYMid meet'} role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : scene}><PostcardDrawing scene={scene}/></svg>
}
