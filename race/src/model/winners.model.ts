import { car } from './race.model';

export interface Winners {
  id: number;
  wins: number;
  time: number;
}

export interface winnerCarData extends car {
  wins: number;
  time: number;
}
