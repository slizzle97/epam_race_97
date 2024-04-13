import { Component, ElementRef, OnInit } from '@angular/core';

import {
  AnimationBuilder,
  AnimationFactory,
  animate,
  style,
} from '@angular/animations';
import { RouterModule } from '@angular/router';
import {
  GarageService,
  animatedCarI,
  car,
  carSpecs,
  isCarDrivable,
} from './garage-service.service';
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

  public animationPlayers: animatedCarI[] = [];
  startAnimation(duration: number, carID?: number) {
    const screenWidth = window.innerWidth;
    const startPosition = 'translateX(0)';
    const endPosition = `translateX(${screenWidth - 300}px)`;
    console.log(duration);
    const animation = this.animationBuilder.build([
      style({ transform: startPosition }),
      animate(duration + 's', style({ transform: endPosition })),
    ]);
    console.log(duration);
    if (duration != 0) {
      if (carID) {
        this.playAnimation(animation, carID);
      } else {
        this.garageService.cars.forEach((car) => {
          this.playAnimation(animation, car.id);
        });
      }
    }
  }
  private playAnimation(animation: AnimationFactory, carID: number) {
    const player = animation.create(document.querySelector('.car-' + carID));
    this.animationPlayers.push({ id: carID, player: player });
    player.play();
    console.log(this.animationPlayers);
  }

  resetAnimation(carID?: number) {
    console.log(this.animationPlayers);
    if (carID !== undefined && this.animationPlayers.length == 1) {
      this.animationPlayers[0].player.reset();
      this.animationPlayers = [];
    } else if (this.animationPlayers.length != 0) {
      this.animationPlayers.forEach((player, index) => {
        player.player.reset();
        this.animationPlayers.splice(index, 1);
      });
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

  onStartCar(car: car | car[]) {
    if (Array.isArray(car)) {
      car.forEach((singleCar) => {
        this.garageService
          .carAction<carSpecs>(singleCar, 'started')
          .subscribe((startResult) => {
            if (startResult.velocity) {
              this.garageService
                .carAction<isCarDrivable>(singleCar, 'drive')
                .subscribe((driveResult) => {
                  if (driveResult) {
                    this.startAnimation(
                      startResult.distance / (startResult.velocity * 1000),
                      singleCar.id
                    );
                  }
                });
            }
          });
      });
    } else {
      this.garageService
        .carAction<carSpecs>(car, 'started')
        .subscribe((startResult) => {
          if (startResult.velocity) {
            this.garageService
              .carAction<isCarDrivable>(car, 'drive')
              .subscribe((driveResult) => {
                if (driveResult) {
                  this.startAnimation(
                    startResult.distance / (startResult.velocity * 1000),
                    car.id
                  );
                }
              });
          }
        });
    }
  }
  onStopCar(animatedCars: car | animatedCarI[]) {
    console.log(animatedCars);
    if (Array.isArray(animatedCars)) {
      animatedCars.forEach((singleCar: animatedCarI) => {
        this.garageService
          .carAction<carSpecs>(singleCar, 'stopped')
          .subscribe((stopResult) => {
            if (stopResult.velocity == 0) {
              this.resetAnimation(singleCar.id);
            }
          });
      });
    } else {
      this.garageService
        .carAction<carSpecs>(animatedCars, 'stopped')
        .subscribe((stopResult) => {
          if (stopResult.velocity == 0) {
            this.resetAnimation(animatedCars.id);
          }
        });
    }
  }
}
