import { Injectable } from '@angular/core';
import { WinnersService } from '../winners/winners-service.service';
import { GarageService } from '../garage/garage-service.service';

@Injectable({ providedIn: 'root' })
export class PaginationService {
  constructor(
    private winnersService: WinnersService,
    private garageService: GarageService
  ) {}
}
