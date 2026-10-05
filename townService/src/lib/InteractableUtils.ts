import { Interactable, ViewingArea } from '../types/CoveyTownSocket';

export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}