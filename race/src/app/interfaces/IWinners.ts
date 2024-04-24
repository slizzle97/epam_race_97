import { car } from './IGarage';

export interface Winners {
  id: number;
  wins: number;
  time: number;
}

export interface winnerCarData extends car {
  wins: number;
  time: number;
}
export interface SortModes {
  wins: boolean | null;
  time: boolean | null;
  id: boolean | null;
  [key: string]: boolean | null;
}
