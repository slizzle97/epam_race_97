import { Component, ElementRef, OnInit } from '@angular/core';

import {
  AnimationBuilder,
  AnimationFactory,
  AnimationPlayer,
  animate,
  style,
} from '@angular/animations';
import { RouterModule } from '@angular/router';
import { GarageService, car } from './garage-service.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.css',
})
export class GarageComponent implements OnInit {
  isAnimating: boolean = false;

  ngOnInit(): void {
    this.garageService.getCars();
  }
  garageFG: FormGroup;
  constructor(
    private animationBuilder: AnimationBuilder,
    private elementRef: ElementRef,
    public garageService: GarageService,
    private fb: FormBuilder
  ) {
    this.garageFG = fb.group({
      createNameFC: [''],
      createColorFC: [''],
      updateNameFC: [''],
      updateColorFC: [''],
    });
  }

  private animationPlayers: { [key: number]: AnimationPlayer } = {};
  startAnimation(time: number, carID?: number) {
    const screenWidth = window.innerWidth;
    const startPosition = 'translateX(0)';
    const endPosition = `translateX(${screenWidth - 300}px)`;

    const animation = this.animationBuilder.build([
      style({ transform: startPosition }),
      animate(time + 's', style({ transform: endPosition })),
    ]);

    if (carID) {
      this.playAnimation(animation, carID);
    } else {
      this.garageService.cars.forEach((car) => {
        this.playAnimation(animation, car.id);
      });
    }
  }
  private playAnimation(animation: AnimationFactory, carID: number) {
    const player = animation.create(document.querySelector('.car-' + carID));
    this.animationPlayers[carID] = player;
    player.play();
  }

  resetAnimation(carID?: number) {
    if (carID !== undefined && this.animationPlayers[carID]) {
      this.animationPlayers[carID].reset();
    } else {
      console.log('');
    }
  }

  onCreateCar() {
    const body: {
      name: string;
      color: string;
    } = {
      name: this.garageFG.get('createNameFC')?.value,
      color: this.garageFG.get('createColorFC')?.value,
    };
    console.log(body, this.garageFG);
    this.garageService.createCar(body);
  }
  onDeleteCar(id: number) {
    this.garageService.deleteCar(id);
  }
  updateCarData: car = {
    name: '',
    color: '',
    id: -1,
  };
  onUpdateCars() {
    this.updateCarData = {
      id: this.updateCarData.id,
      name: this.garageFG.get('updateNameFC')?.value,
      color: this.garageFG.get('updateColorFC')?.value,
    };
    if (this.updateCarData.id != -1)
      this.garageService.updateCars(this.updateCarData);
  }
  selectCar(car: car) {
    this.garageFG.patchValue({
      updateNameFC: car.name,
      updateColorFC: car.color,
    });
    this.updateCarData = car;
  }
  startStopCar(car: car | car[]) {
    if (Array.isArray(car)) {
      car.forEach((singleCar) => {
        this.garageService.startStopCar(singleCar).subscribe((res) => {
          this.startAnimation(res.distance / res.velocity, singleCar.id);
        });
      });
    } else {
      this.garageService.startStopCar(car).subscribe((res) => {
        this.startAnimation(res.distance / res.velocity, car.id);
      });
    }
  }
}
