import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GarageHeaderComponent } from '../garage/garage-header/garage-header.component';
import { WinnersService } from '../Services/winners-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { GarageService } from '../Services/garage-service.service';
import { PaginationComponent } from '../pagination/pagination.component';
import { SortModes } from '../interfaces/IWinners';

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [
    RouterModule,
    GarageHeaderComponent,
    PaginationComponent,
    NgFor,
    CommonModule,
  ],
  templateUrl: './winners.component.html',
  styleUrl: './winners.component.css',
})
export class WinnersComponent implements OnInit {
  constructor(
    public winnersService: WinnersService,
    private garageService: GarageService,
  ) {}
  sortMode: SortModes = { wins: false, time: false, id: false };

  ngOnInit(): void {
    this.garageService.getCars(true);
    this.winnersService.getWinners();
    this.winnersService.sortMode$.subscribe((mode) => {
      this.sortMode = mode;
    });
  }
}
