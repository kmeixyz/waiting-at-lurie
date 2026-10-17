import { CreatureIcon } from './creatures'

export function BubbleArt() {
  return <div className="bubble-art" aria-hidden="true">
    <span className="art-bubble art-bubble-one"><CreatureIcon kind="bunny" size={112}/></span>
    <span className="art-bubble art-bubble-two"><CreatureIcon kind="dino" size={136}/></span>
    <span className="art-bubble art-bubble-three"><span className="bubble-face"/></span>
    <span className="art-bubble art-bubble-four"/>
    <span className="art-bubble art-bubble-five"/>
    <span className="art-orbit"/>
  </div>
}
