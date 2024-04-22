import { Component } from '@angular/core';

import { GarageHeaderComponent } from './garage-header/garage-header.component';
import { GarageFormComponent } from './garage-form/garage-form.component';
import { RaceTrackComponent } from './race-track/race-track.component';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [GarageHeaderComponent, GarageFormComponent, RaceTrackComponent],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.css',
})
export class GarageComponent {}
