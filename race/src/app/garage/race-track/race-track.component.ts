import { Component, OnInit } from '@angular/core';
import { GarageService } from '../garage-service.service';
import { GarageActionService } from '../garage-action-service.service';
import { CommonModule } from '@angular/common';
import { car, animatedCarI } from '../../../model/race.model';

@Component({
  selector: 'app-race-track',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './race-track.component.html',
  styleUrl: './race-track.component.css',
})
export class RaceTrackComponent implements OnInit {
  constructor(
    public garageService: GarageService,
    public garageActionService: GarageActionService
  ) {}
  ngOnInit(): void {
    this.garageService.getCars();
  }

  getRange(count: number): number[] {
    return Array(count)
      .fill(0)
      .map((x, i) => i);
  }

  onGetPaginatedCars(): car[] {
    return this.garageActionService.getPaginatedCars();
  }
  onSelectCar(car: car) {
    this.garageActionService.selectCar(car);
  }
  onStartCar(car: car | car[]) {
    this.garageActionService.startCar(car);
  }
  onStopCar(animatedCar: car | animatedCarI[]) {
    this.garageActionService.stopCar(animatedCar);
  }

  onDeleteCar(id: number) {
    this.garageActionService.animationPlayers.forEach((player, index) => {
      if (id == player.id) {
        this.garageActionService.animationPlayers.splice(index, 1);
      }
    });
    this.garageService.deleteCar(id);
  }
}
