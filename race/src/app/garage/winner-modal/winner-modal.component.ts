import { Component } from '@angular/core';
import { GarageActionService } from '../garage-action-service.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-winner-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './winner-modal.component.html',
  styleUrl: './winner-modal.component.css',
})
export class WinnerModalComponent {
  constructor(public garageActionService: GarageActionService) {}

  closeModal() {
    this.garageActionService.closeModal = -1;
  }
}
