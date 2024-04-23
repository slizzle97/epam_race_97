import { Injectable } from '@angular/core';
import { GarageService } from './garage-service.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
import { WinnersService } from '../winners/winners-service.service';

@Injectable({ providedIn: 'root' })
export class GarageActionService {
  garageFG: FormGroup;
  constructor(
    private garageService: GarageService,
    private animationBuilder: AnimationBuilder,
    private fb: FormBuilder,
    private winnersService: WinnersService
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

  minAnimationTime = Number.MAX_VALUE;
  minAnimationTimeCar: car = {
    name: '',
    color: '',
    id: -1,
  };

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

  startStatusCar$(car: car[]) {
    const observables = car.map((singleCar) => {
      return this.garageService.carAction<carSpecs>(singleCar, 'started');
    });
    return observables;
  }
  calcAnimTime(startResult: carSpecs) {
    return startResult.distance / (startResult.velocity * 1000);
  }

  startCar(car: car | car[]) {
    if (Array.isArray(car)) {
      this.startMultipleCars(car);
    } else {
      this.startSingleCar(car);
      this.updateCarStatus(car.id, { disabled: false });
    }
  }

  private startMultipleCars(cars: car[]) {
    const observables = this.startStatusCar$(cars);
    forkJoin(observables).subscribe((startResults) => {
      startResults.forEach((startResult, index) => {
        cars[index].disabled = false;
        const singleCar = cars[index];
        if (startResult.velocity) {
          this.handleCarStartAnimation(singleCar, startResult);
        }
      });
    });
  }

  private startSingleCar(car: car) {
    this.garageService
      .carAction<carSpecs>(car, 'started')
      .subscribe((startResult) => {
        if (startResult.velocity) {
          this.handleCarStartAnimation(car, startResult);
        }
      });
  }

  private handleCarStartAnimation(car: car, startResult: carSpecs) {
    const animationTime = this.calcAnimTime(startResult);

    this.startAnimation(animationTime, car.id);

    this.garageService.carAction<isCarDrivable>(car, 'drive').subscribe(
      () => {
        // with isCarStillAnimated check if car has not been reset,
        // this assures that if car was still moving and reset button was clicked, CAR WILL NOT BE REGISTRED AS WINNER
        const isCarStillAnimated = this.animationPlayers.find(
          (car) => car.id == car.id
        );
        if (animationTime < this.minAnimationTime && isCarStillAnimated) {
          this.minAnimationTime = Number(animationTime.toFixed(3));
          this.minAnimationTimeCar = car;
          this.winnersService.getWinner(
            this.minAnimationTimeCar.id,
            this.minAnimationTime
          );
        }
      },
      (error) => {
        if (error.status === 500) {
          this.stopAnimation(car.id);
        }
      }
    );
  }

  stopCar(animatedCars: car | animatedCarI[]) {
    if (Array.isArray(animatedCars)) {
      const pageCarIds = this.garageService.cars.map((car) => car.id);
      animatedCars.forEach((singleCar: animatedCarI) => {
        if (pageCarIds.includes(singleCar.id)) {
          this.garageService
            .carAction<carSpecs>(singleCar, 'stopped')
            .subscribe((stopResult) => {
              if (stopResult.velocity == 0) {
                this.resetAnimation(singleCar.id);
                this.updateCarStatus(singleCar.id, { disabled: true });
              }
            });
        }
      });
      this.minAnimationTime = Number.MAX_VALUE;
      this.minAnimationTimeCar.id = -1;
    } else {
      if (this.garageService.cars.some((car) => car.id === animatedCars.id)) {
        this.garageService
          .carAction<carSpecs>(animatedCars, 'stopped')
          .subscribe((stopResult) => {
            if (stopResult.velocity == 0) {
              this.resetAnimation(animatedCars.id);
              this.updateCarStatus(animatedCars.id, { disabled: true });
            }
          });
      }
    }
  }
  updateCarStatus(carId: number, updates: Partial<car>) {
    const carIndex = this.garageService.cars.findIndex(
      (car) => car.id === carId
    );
    if (carIndex !== -1) {
      this.garageService.cars[carIndex] = {
        ...this.garageService.cars[carIndex],
        ...updates,
      };
    }
  }
}
