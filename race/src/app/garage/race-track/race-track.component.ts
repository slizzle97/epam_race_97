import { Component, OnInit } from '@angular/core';
import { GarageService } from '../../Services/garage-service.service';
import { GarageActionService } from '../../Services/garage-action-service.service';
import { CommonModule, NgIf } from '@angular/common';
import { car, animatedCarI } from '../../../model/race.model';
import { PaginationComponent } from '../../pagination/pagination.component';
import { WinnerModalComponent } from '../winner-modal/winner-modal.component';
import { WinnersService } from '../../Services/winners-service.service';

@Component({
  selector: 'app-race-track',
  standalone: true,
  imports: [CommonModule, PaginationComponent, WinnerModalComponent, NgIf],
  templateUrl: './race-track.component.html',
  styleUrl: './race-track.component.css',
})
export class RaceTrackComponent implements OnInit {
  constructor(
    public garageService: GarageService,
    public garageActionService: GarageActionService,
    private winnersService: WinnersService
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
    const carsOnCurrentPage = this.garageService.cars;
    return carsOnCurrentPage;
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
    // after deleting car from garage, we check if that car has any win,
    // if so we call deleteWinner method that removes its wins as well, otherwise request is not sent.
    this.garageService.deleteCar(id);
    const winnersData = this.winnersService
      .getWinners(this.garageService.currentPage)
      .find((car: car) => car.id === id);
    if (winnersData) {
      this.garageService.deleteWinner(id);
    }
  }
}
