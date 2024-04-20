import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GarageHeaderComponent } from '../garage/garage-header/garage-header.component';
import { WinnersService } from './winners-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { GarageService } from '../garage/garage-service.service';

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [RouterModule, GarageHeaderComponent, NgFor, CommonModule],
  templateUrl: './winners.component.html',
  styleUrl: './winners.component.css',
})
export class WinnersComponent implements OnInit {
  constructor(
    public winnersService: WinnersService,
    private garageService: GarageService
  ) {}
  ngOnInit(): void {
    if (this.garageService.cars.length == 0) {
      this.garageService.getCars();
    }
    this.winnersService.getWinners();
  }
}
