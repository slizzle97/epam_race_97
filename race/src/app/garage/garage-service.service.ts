import { AnimationPlayer } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface car {
  name: string;
  color: string;
  id: number;
}
interface createCar {
  name: string;
  color: string;
}
export interface carSpecs {
  velocity: number;
  distance: number;
}
export interface isCarDrivable {
  success: boolean;
}
export interface animatedCarI {
  id: number;
  player: AnimationPlayer;
}

@Injectable({ providedIn: 'root' })
export class GarageService {
  constructor(private http: HttpClient) {}

  cars: car[] = [];

  domainURL: string = 'http://127.0.0.1:3000';

  getCars() {
    this.http
      .get<car[]>(`${this.domainURL}/garage`)
      .subscribe((res) => (this.cars = res));
  }
  createCar(body: createCar) {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.http
      .post('${this.domainURL}/garage', body, { headers })
      .subscribe((res) => {
        this.getCars();
        console.log(res);
      });
  }

  deleteCar(id: number) {
    this.http.delete(`${this.domainURL}/garage/${id}`).subscribe((res) => {
      this.getCars();
      console.log(res);
    });
  }
  updateCars(car: car) {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.http
      .put(
        `${this.domainURL}/garage/${car.id}`,
        { color: car.color, name: car.name },
        { headers }
      )
      .subscribe((res) => {
        this.getCars();
        console.log(res);
      });
  }

  carAction<U>(car: car | animatedCarI, driveMode: string): Observable<U> {
    return this.http.patch(
      `${this.domainURL}/engine/?id=${car.id}&status=${driveMode}`,
      {}
    ) as Observable<U>;
  }
}
