/** Pure game rules. Randomness is injectable. */
type RNG = () => number
export type Direction = 'up' | 'down' | 'left' | 'right'
export function shuffle<T>(items: readonly T[], rng: RNG = Math.random): T[] { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!]}return a }

type MemoryState={deck:string[];open:number[];matched:number[];turns:number}
const memoryPictures=['star','heart','planet','leaf','music','gem','sun','robot']
export function memoryDeal(rng:RNG=Math.random,pairs:3|6=6):MemoryState{return{deck:shuffle(shuffle(memoryPictures,rng).slice(0,pairs).flatMap(k=>[k,k]),rng),open:[],matched:[],turns:0}}
export function memoryFlip(state:MemoryState,index:number):MemoryState {if(index<0||index>=state.deck.length||state.open.length>=2||state.open.includes(index)||state.matched.includes(index))return state;const open=[...state.open,index];if(open.length===1)return{...state,open};if(state.deck[open[0]!]===state.deck[index])return{...state,open:[],matched:[...state.matched,...open],turns:state.turns+1};return{...state,open,turns:state.turns+1}}

export type SkyItem={id:number;lane:number;distance:number;kind:'gem'|'block';hit:boolean}
export type SkyState={distance:number;lane:number;score:number;gems:number;bumps:number;combo:number;air:number;cooldown:number;items:SkyItem[]}
export function makeSky(rng:RNG=Math.random):SkyState {const items:SkyItem[]=[];for(let row=0;row<110;row++){const lane=Math.floor(rng()*3)-1;items.push({id:row*2,lane,distance:16+row*9,kind:'gem',hit:false});if(row%3===2)items.push({id:row*2+1,lane:lane===1?-1:lane+1,distance:16+row*9,kind:'block',hit:false})}return{distance:0,lane:0,score:0,gems:0,bumps:0,combo:0,air:0,cooldown:0,items}}
// Every 4 gems in a row raise the multiplier, up to 5x; a bump starts it over. The multiplier is what the next gem earns.
export const skyStreakStep=4,skyMaxMultiplier=5
export function skyMultiplier(combo:number){return Math.min(skyMaxMultiplier,Math.floor(combo/skyStreakStep)+1)}
// How full the streak ring is on the way to the next multiplier: 0 to 1, and full once at the top.
export function skyStreakProgress(combo:number){return skyMultiplier(combo)===skyMaxMultiplier?1:(combo%skyStreakStep)/skyStreakStep}
export function skyLane(state:SkyState,d:number):SkyState{return{...state,lane:Math.max(-1,Math.min(1,state.lane+d))}}
export function skyJump(state:SkyState):SkyState{return state.cooldown>0?state:{...state,air:.8,cooldown:1.15}}
export function advanceSky(state:SkyState,dt:number,speed=10):SkyState {if(!Number.isFinite(dt)||dt<=0)return state;const next={...state,distance:state.distance+dt*speed,air:Math.max(0,state.air-dt),cooldown:Math.max(0,state.cooldown-dt)};next.items=state.items.map(item=>{if(item.hit||item.distance<=state.distance||item.distance>next.distance||item.lane!==state.lane)return item;if(item.kind==='gem'){next.score+=10*skyMultiplier(next.combo);next.gems++;next.combo++}else {const hitAt=(item.distance-state.distance)/speed;if(state.air-hitAt<=.12){next.bumps++;next.combo=0}}return{...item,hit:true}});return next}
