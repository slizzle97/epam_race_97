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
  createCar,
  isCarDrivable,
} from './garage-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, forkJoin } from 'rxjs';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, NgFor],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.css',
})
export class GarageComponent implements OnInit {
  isAnimating: boolean = false;

  ngOnInit(): void {
    this.garageService.getCars();
    this.applyAnimationStyling();
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
      createColorFC: ['#000'],
      updateNameFC: [''],
      updateColorFC: [''],
    });
  }

  public animationPlayers: animatedCarI[] = [];
  animationState: { [carId: number]: string } = {};
  startAnimation(duration: number, carID?: number) {
    const screenWidth = window.innerWidth;
    const savedPosition = this.animationPlayers.find(
      (player) => player.id === carID
    )?.animationPosition;
    const startPosition = 'translateX(0)';
    const endPosition = savedPosition
      ? `translateX(${screenWidth * savedPosition}px)`
      : `translateX(${screenWidth - 300}px)`;
    const animation = this.animationBuilder.build([
      style({ transform: startPosition }),
      animate(duration + 's', style({ transform: endPosition })),
    ]);
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
    player.play();
    this.animationPlayers.push({
      id: carID,
      player: player,
    });
    // after animation is done, so the car reached the finish line, its position is saved, so that after paging, it's position is not lost;
    player.onDone(() => {
      this.animationPlayers = this.animationPlayers.map(
        (player: animatedCarI) => {
          if (player.id === carID) {
            return {
              ...player,
              animationPosition: player.player.getPosition(),
            };
          } else {
            return player;
          }
        }
      );
    });
  }
  // reseting car to its inital position. Two cases: 1. reset car with its own reset button. 2. reset all cars that have been animated;
  resetAnimation(carID?: number) {
    this.animationPlayers.forEach((player, index) => {
      if (carID !== undefined) {
        if (player.id == carID) {
          player.player.reset();
          this.animationPlayers.splice(index, 1);
        }
      } else if (this.animationPlayers.length != 0) {
        this.animationPlayers.forEach((player, index) => {
          player.player.reset();
          this.animationPlayers.splice(index, 1);
        });
      }
    });
  }
  stopAnimation(carID: number) {
    if (carID) {
      this.animationPlayers.forEach((player) => {
        if (player.id == carID) {
          player.player.pause();
          player.animationPosition = player.player.getPosition();
        }
      });
    }
  }

  onCreateCar() {
    const body: createCar = {
      name: this.garageFG.get('createNameFC')?.value,
      color: this.garageFG.get('createColorFC')?.value,
    };
    console.log(body, this.garageFG);
    this.garageService.createCar(body);
  }
  onDeleteCar(id: number) {
    this.animationPlayers.forEach((player, index) => {
      if (id == player.id) {
        this.animationPlayers.splice(index, 1);
      }
    });
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
      const observables = car.map((singleCar) => {
        return this.garageService.carAction<carSpecs>(singleCar, 'started');
      });

      forkJoin(observables).subscribe((startResults) => {
        startResults.forEach((startResult, index) => {
          const singleCar = car[index];
          if (startResult.velocity) {
            this.startAnimation(
              startResult.distance / (startResult.velocity * 1000),
              singleCar.id
            );

            this.garageService
              .carAction<isCarDrivable>(singleCar, 'drive')
              .pipe(
                catchError((error) => {
                  if (error.status === 500) {
                    this.stopAnimation(singleCar.id);
                  }
                  return [];
                })
              )
              .subscribe();
          }
        });
      });
    } else {
      this.garageService
        .carAction<carSpecs>(car, 'started')
        .subscribe((startResult) => {
          if (startResult.velocity) {
            this.startAnimation(
              startResult.distance / (startResult.velocity * 1000),
              car.id
            );
            this.garageService
              .carAction<isCarDrivable>(car, 'drive')
              .pipe(
                catchError((error) => {
                  if (error.status === 500) {
                    this.stopAnimation(car.id);
                  }
                  return [];
                })
              )
              .subscribe();
          }
        });
    }
  }
  onStopCar(animatedCars: car | animatedCarI[]) {
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
  currentPage: number = 1;
  carsPerPage: number = 7;
  // getPaginatedCars(): car[] {
  //   const startIndex = (this.currentPage - 1) * this.carsPerPage;
  //   const endIndex = startIndex + this.carsPerPage;
  //   const carsOnPage = this.garageService.cars.slice(startIndex, endIndex);
  //   if (this.animationPlayers.length > 0) {
  //     this.animationPlayers.forEach((player) => {
  //       carsOnPage.forEach((carOnPage) => {
  //         if (carOnPage.id === player.id) {
  //           const carEl = document.querySelector(
  //             '.car-' + carOnPage.id
  //           ) as HTMLElement;
  //           carEl.style.transform = `translateX(${
  //             window.innerWidth * (player.animationPosition || 0)
  //           })`;
  //         }
  //       });
  //     });
  //   }
  //   return carsOnPage;
  // }
  carsOnPage: car[] = [];
  getPaginatedCars(): car[] {
    const startIndex = (this.currentPage - 1) * this.carsPerPage;
    const endIndex = startIndex + this.carsPerPage;
    this.garageService.onPagechange();
    this.carsOnPage = this.garageService.cars.slice(startIndex, endIndex);
    return this.carsOnPage;
  }

  applyAnimationStyling() {
    this.garageService.pageChange$.subscribe(() => {
      if (this.animationPlayers.length > 0) {
        this.animationPlayers.forEach((player) => {
          this.carsOnPage.forEach((carOnPage) => {
            if (carOnPage.id === player.id) {
              const carEl = document.querySelector(
                '.car-' + carOnPage.id
              ) as HTMLElement;
              if (carEl) {
                carEl.style.transform = `translateX(${
                  window.innerWidth * (player.animationPosition || 0) - 300
                }px)`;
              }
            }
          });
        });
      }
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.garageService.cars.length / this.carsPerPage);
  }
}
