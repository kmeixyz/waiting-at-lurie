import { useId } from 'react'

export function ColorLabArt() {
  const id = useId().replace(/:/g, '')
  return <svg className="discovery-art color-lab-art" viewBox="0 0 600 420" fill="none" aria-hidden="true">
    <defs>
      {[['rose','#f4b3bb','#d96d86'],['yellow','#f8e6a2','#e1b357'],['blue','#b7d9f1','#73a0c8'],['green','#c8e3c8','#8cb695']].map(([name, light, dark]) => <radialGradient key={name} id={`${id}-${name}`} cx="30%" cy="20%" r="90%"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></radialGradient>)}
      <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#4c6557" floodOpacity=".13"/></filter>
    </defs>
    <ellipse cx="314" cy="363" rx="190" ry="19" fill="#4c6557" opacity=".08"/>
    <g filter={`url(#${id}-shadow)`}>
      <rect x="115" y="97" width="140" height="195" rx="38" fill={`url(#${id}-rose)`} transform="rotate(-18 185 194)"/>
      <rect x="311" y="82" width="140" height="195" rx="38" fill={`url(#${id}-blue)`} transform="rotate(20 381 179)"/>
      <rect x="223" y="187" width="156" height="165" rx="42" fill={`url(#${id}-yellow)`} transform="rotate(5 301 270)"/>
      <circle cx="449" cy="315" r="43" fill={`url(#${id}-green)`}/>
    </g>
    <circle cx="183" cy="185" r="25" fill="white" opacity=".85"/>
    <path d="m381 144 29 50h-58z" fill="white" opacity=".9"/>
    <path d="m303 239 29 29-29 29-29-29z" fill="white" opacity=".9"/>
    <path d="M94 315h24m-12-12v24M462 92h18m-9-9v18" stroke="#648172" strokeWidth="3" strokeLinecap="round" opacity=".5"/>
    <circle cx="278" cy="91" r="7" fill="#fff"/><circle cx="501" cy="226" r="6" fill="#fff"/>
  </svg>
}

export function PebbleArt() {
  return <svg className="discovery-art" viewBox="0 0 600 420" aria-hidden="true">
    <ellipse cx="300" cy="357" rx="220" ry="18" fill="#a29d93" opacity=".13"/>
    {[0,1,2].map((jar) => <g key={jar} transform={`translate(${100 + jar * 145},70)`}>
      <path d="M0 0h110v234q0 38-38 38H38Q0 272 0 234Z" fill="#fff" fillOpacity=".65" stroke="#c4cbd0" strokeWidth="3"/>
      {[0,1,2].map((row) => <g key={row} transform={`translate(15,${185-row*76})`}><rect width="80" height="65" rx="27" fill={['#d9868f','#779fc4','#8aaa83'][(row+jar)%3]}/><text x="40" y="43" textAnchor="middle" fill="#fff" fontSize="31">{['●','◆','▲'][(row+jar)%3]}</text></g>)}
    </g>)}
  </svg>
}
