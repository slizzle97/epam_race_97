import { Component, ElementRef, OnInit } from '@angular/core';

import { AnimationBuilder, animate, style } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { GarageService } from './garage-service.service';
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
    });
  }

  startAnimation(carID?: number) {
    const screenWidth = window.innerWidth;
    const startPosition = 'translateX(0)';
    const endPosition = `translateX(${screenWidth - 100}px)`;

    const animation = this.animationBuilder.build([
      style({ transform: startPosition }), // Start position
      animate('2s', style({ transform: endPosition })), // End position
    ]);
    console.log(carID);
    if (carID) {
      const player = animation.create(document.querySelector('.car-' + carID));
      player.play();
    } else {
      this.garageService.cars.forEach((car) => {
        const player = animation.create(
          document.querySelector('.car-' + car.id)
        );
        player.play();
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
}
