import { AnimationPlayer } from '@angular/animations';

export interface car {
  name: string;
  color: string;
  id: number;
}
export interface createCar {
  name: string;
  color: string;
}
export interface carSpecs {
  velocity: number;
  distance: number;
}
export interface isCarDrivable {
  success: boolean;
}
export interface animatedCarI {
  id: number;
  player: AnimationPlayer;
  animationPosition?: number;
}
