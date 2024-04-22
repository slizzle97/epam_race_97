import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GarageHeaderComponent } from '../garage/garage-header/garage-header.component';
import { WinnersService } from './winners-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { GarageService } from '../garage/garage-service.service';
import { PaginationComponent } from '../pagination/pagination.component';
import { SortModes } from '../../model/winners.model';
import { take } from 'rxjs';

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
    private garageService: GarageService
  ) {}
  ngOnInit(): void {
    this.garageService.getCars(true);
    this.winnersService.getWinners();
  }

  sortWinners(sortName: keyof SortModes) {
    this.winnersService.changeSortMode(sortName);
    this.winnersService.sortMode$
      .pipe(take(1))
      .subscribe((sortMode: SortModes) => {
        this.winnersService.getWinners(
          sortName,
          sortMode[sortName] ? 'ASC' : 'DESC'
        );
      });
  }
}
