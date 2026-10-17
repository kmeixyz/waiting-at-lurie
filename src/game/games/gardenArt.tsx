export const flowerKinds = ['Daisy', 'Tulip', 'Starflower'] as const
export type FlowerKind = typeof flowerKinds[number]
export type Plant = { flower: FlowerKind; stage: number }

function FlowerShape({ flower }: { flower: FlowerKind }) {
  return <g>
    {flower === 'Daisy' ? <g fill="#fff8e6" stroke="#c48c32" strokeWidth="1.5">{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="0" cy="-16" rx="8" ry="15" transform={`rotate(${i * 45})`}/>)}</g>
      : flower === 'Tulip' ? <path d="M-27-24-13-12 0-30 13-12 27-24V0C27 34-27 34-27 0Z" fill="#ec8ba3" stroke="#b45472" strokeWidth="2"/>
      : <path d="M0-34 11-12 35-10 18 8 21 32 0 20-21 32-18 8-35-10-11-12Z" fill="#c7adf3" stroke="#8365b0" strokeWidth="2"/>}
    <circle cy="0" r={flower === 'Tulip' ? 12 : 14} fill="#f9cc64"/>
    <g fill="#463b30"><circle cx="-5" cy="-2" r="2"/><circle cx="5" cy="-2" r="2"/></g>
    <path d="M-4 5q4 4 8 0" fill="none" stroke="#463b30" strokeWidth="2" strokeLinecap="round"/>
  </g>
}

export function FlowerArt({ flower }: { flower: FlowerKind }) {
  return <svg viewBox="-42 -42 84 84" aria-hidden="true"><FlowerShape flower={flower}/></svg>
}

const fullGarden: Plant[] = flowerKinds.map(flower => ({ flower, stage: 3 }))
export function GardenArt({ plants = fullGarden, active = -1, crop = false }: { plants?: Plant[]; active?: number; crop?: boolean }) {
  const description = plants.length ? plants.map((plant, i) => `Pot ${i + 1}: ${plant.flower} ${plant.stage === 3 ? 'in bloom' : plant.stage === 2 ? 'sprout' : 'seed'}`).join('. ') : 'Three pots ready for your flowers'
  return <svg className="garden-art" viewBox="0 0 540 300" preserveAspectRatio={crop ? 'xMidYMid slice' : 'xMidYMid meet'} role="img" aria-label={description}>
    <rect width="540" height="300" rx={crop ? 0 : 24} fill="#e7f0e4"/>
    <circle cx="450" cy="56" r="27" fill="#f8d373"/>
    <path d="M48 61q8-25 32-15 17-25 37-3 28-4 31 18Z" fill="#fff" opacity=".85"/>
    <path d="M0 237Q140 195 270 229T540 223V300H0Z" fill="#cddfc6"/>
    {[0, 1, 2].map(i => {
      const plant = plants[i]
      return <g key={i} transform={`translate(${108 + i * 162} 228)`}>
        <ellipse cy="42" rx="60" ry="10" fill="#93ae86" opacity=".2"/>
        {active === i && <ellipse cy="46" rx="57" ry="10" fill="none" stroke="#426543" strokeWidth="3" strokeDasharray="5 5"/>}
        <path d="M-44-10H44L34 41Q0 49-34 41Z" fill="#c07858"/>
        <rect x="-49" y="-17" width="98" height="19" rx="7" fill="#d89770"/>
        <ellipse cy="-15" rx="39" ry="6" fill="#6c483b"/>
        {plant && (plant.stage >= 2 ? <g>
          <path d={`M0-15V${plant.stage === 3 ? -100 : -55}`} stroke="#47774b" strokeWidth="7" strokeLinecap="round"/>
          <path d="M0-35Q-36-34-30-58 0-60 0-35M0-48Q31-48 29-73 1-72 0-48" fill="#649958"/>
          {plant.stage === 3 && <g transform="translate(0 -115)"><FlowerShape flower={plant.flower}/></g>}
        </g> : <ellipse cy="-20" rx="7" ry="5" fill="#f2d5a7"/>)}
        <path d="M-8 19q8 7 16 0" stroke="#fff1e5" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>
    })}
  </svg>
}
