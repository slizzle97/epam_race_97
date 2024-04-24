import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GarageService } from '../../Services/garage-service.service';
import { GarageActionService } from '../../Services/garage-action-service.service';
import { animatedCarI, car, createCar } from '../../../model/race.model';

@Component({
  selector: 'app-garage-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './garage-form.component.html',
  styleUrl: './garage-form.component.css',
})
export class GarageFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public garageService: GarageService,
    public garageActionService: GarageActionService,
  ) {}

  ngOnInit(): void {
    this.applyAnimationStyling();
  }
  onCreateCar() {
    const body: createCar = {
      name: this.garageActionService.garageFG.get('createNameFC')?.value,
      color: this.garageActionService.garageFG.get('createColorFC')?.value,
    };
    this.garageService.createCar(body);
    this.garageActionService.garageFG.get('createNameFC')?.reset();
    this.garageActionService.garageFG.get('createColorFC')?.reset();
  }

  onUpdateCars() {
    this.garageActionService.updateCarData = {
      id: this.garageActionService.updateCarData.id,
      name: this.garageActionService.garageFG.get('updateNameFC')?.value,
      color: this.garageActionService.garageFG.get('updateColorFC')?.value,
    };
    if (this.garageActionService.updateCarData.id != -1)
      this.garageService.updateCars(this.garageActionService.updateCarData);
    this.garageActionService.garageFG.get('updateNameFC')?.reset();
    this.garageActionService.garageFG.get('updateColorFC')?.reset();
    this.garageActionService.updateCarData.id = -1;
  }

  onStopCar(animatedCar: car | animatedCarI[]) {
    this.garageActionService.stopCar(animatedCar);
  }
  onStartCar(car: car | car[]) {
    this.garageActionService.startCar(car);
  }
  applyAnimationStyling() {
    const screenWidth = window.innerWidth;
    this.garageService.pageChange$.subscribe(() => {
      this.updateAnimationStyling(screenWidth);
    });
  }

  updateAnimationStyling(screenWidth: number) {
    if (this.garageActionService.animationPlayers.length > 0) {
      this.garageActionService.animationPlayers.forEach((player) => {
        this.garageService.cars.forEach((carOnPage) => {
          if (carOnPage.id === player.id) {
            const carEl = document.querySelector(
              '.car-' + carOnPage.id,
            ) as HTMLElement;
            if (carEl) {
              carEl.style.transform = `translateX(${
                player.animationPosition
                  ? (screenWidth - this.garageActionService.animationPostion) *
                    player.animationPosition
                  : screenWidth - this.garageActionService.animationPostion
              }px)`;
            }
          }
        });
      });
    }
  }

  onGenerateCars() {
    for (let i = 0; i < 100; i++) {
      const color: string = this.garageService.getRandomColor();
      const name: string = this.garageService.generateRandomCar();
      const body: createCar = {
        name: name,
        color: color,
      };
      this.garageService.createCar(body);
    }
  }
}
