import { useRef } from 'react'
import type { PointerEvent } from 'react'
import type { Direction } from './logic'
export function keyDirection(key:string):Direction|null{return({ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}as Record<string,Direction>)[key]??null}
export function useBoardInput(onMove:(d:Direction)=>void){const origin=useRef<{x:number;y:number}|null>(null);return{onPointerDown:(e:PointerEvent)=>{origin.current={x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId)}catch{/* Swipes still read from pointerup. */}},onPointerUp:(e:PointerEvent)=>{const at=origin.current;origin.current=null;if(!at)return;const dx=e.clientX-at.x,dy=e.clientY-at.y;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;onMove(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')},onPointerCancel:()=>{origin.current=null}}}
