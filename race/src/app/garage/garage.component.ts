import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { GarageService } from './garage-service.service';
import { car } from '../../model/race.model';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GarageHeaderComponent } from './garage-header/garage-header.component';
import { GarageActionService } from './garage-action-service.service';
import { GarageFormComponent } from './garage-form/garage-form.component';
import { RaceTrackComponent } from './race-track/race-track.component';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    NgFor,
    GarageHeaderComponent,
    GarageFormComponent,
    RaceTrackComponent,
  ],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.css',
})
export class GarageComponent {
  isAnimating: boolean = false;
  constructor(
    public garageService: GarageService,
    public garageActionService: GarageActionService
  ) {}

  resetAnimation(carID: number) {
    this.garageActionService.resetAnimation(carID);
  }

  stopAnimation(carID: number) {
    this.garageActionService.stopAnimation(carID);
  }

  onStartCar(car: car | car[]) {
    this.garageActionService.startCar(car);
  }
}
