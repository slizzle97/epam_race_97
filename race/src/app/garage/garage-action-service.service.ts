import { Injectable } from '@angular/core';
import { GarageService } from './garage-service.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, catchError } from 'rxjs';
import {
  AnimationBuilder,
  AnimationFactory,
  animate,
  style,
} from '@angular/animations';
import {
  animatedCarI,
  car,
  carSpecs,
  isCarDrivable,
} from '../../model/race.model';

@Injectable({ providedIn: 'root' })
export class GarageActionService {
  garageFG: FormGroup;
  constructor(
    private garageService: GarageService,
    private animationBuilder: AnimationBuilder,
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

  updateCarData: car = {
    name: '',
    color: '',
    id: -1,
  };
  carsOnPage: car[] = [];

  animationState: { [carId: number]: string } = {};
  startAnimation(duration: number, carID?: number) {
    const screenWidth = window.innerWidth;
    const savedPosition = this.animationPlayers.find(
      (player) => player.id === carID
    )?.animationPosition;
    const startPosition = 'translateX(0)';
    const endPosition = savedPosition
      ? `translateX(${screenWidth * savedPosition}px)`
      : `translateX(${screenWidth - 270}px)`;
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

  selectCar(car: car) {
    this.garageFG.patchValue({
      updateNameFC: car.name,
      updateColorFC: car.color,
    });
    this.updateCarData = car;
  }
  resetAnimation(carID: number) {
    this.animationPlayers.forEach((player, index) => {
      if (player.id == carID) {
        player.player.reset();
        this.animationPlayers.splice(index, 1);
        const el = document.querySelector('.car-' + player.id) as HTMLElement;
        el.style.transform = 'translateX(0)';
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

  startCar(car: car | car[]) {
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
  stopCar(animatedCars: car | animatedCarI[]) {
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
  currentPage: number = 1;
  carsPerPage: number = 7;
  getPaginatedCars(): car[] {
    const startIndex = (this.currentPage - 1) * this.carsPerPage;
    const endIndex = startIndex + this.carsPerPage;
    this.garageService.onPagechange();
    this.carsOnPage = this.garageService.cars.slice(startIndex, endIndex);
    return this.carsOnPage;
  }
  getTotalPages(): number {
    return Math.ceil(this.garageService.cars.length / this.carsPerPage);
  }
}
