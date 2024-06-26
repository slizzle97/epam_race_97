import { Component, Input } from '@angular/core';
import { WinnersService } from '../Services/winners-service.service';
import { GarageService } from '../Services/garage-service.service';
import { GarageActionService } from '../Services/garage-action-service.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  constructor(
    public winnersService: WinnersService,
    public garageService: GarageService,
    private garageActionService: GarageActionService,
  ) {}

  @Input() paginationLocation: string = '';
  pageNumber: number = 0;
  onPageChange(actionMode: string) {
    if (this.paginationLocation === 'garagePage') {
      if (actionMode === 'increment') {
        if (this.garageService.currentPage < this.garageService.totalPages) {
          this.garageService.currentPage++;
          this.garageService.getCars();
          this.garageActionService.minAnimationTime = Number.MAX_VALUE;
          this.garageActionService.closeModal = -1;
        }
      } else {
        if (this.garageService.currentPage > 1) {
          this.garageService.currentPage--;
          this.garageService.getCars();
        }
      }
    } else {
      if (actionMode === 'increment') {
        if (this.winnersService.currentPage < this.winnersService.totalPages) {
          this.winnersService.currentPage++;
          this.winnersService.sortWinners();
        }
      } else {
        if (this.winnersService.currentPage > 1) {
          this.winnersService.currentPage--;
          this.winnersService.sortWinners();
        }
      }
    }
  }
}
