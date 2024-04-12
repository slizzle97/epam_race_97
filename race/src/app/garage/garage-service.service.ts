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
interface carSpecs {
  velocity: number;
  distance: number;
}

@Injectable({ providedIn: 'root' })
export class GarageService {
  constructor(private http: HttpClient) {}

  cars: car[] = [];

  getCars() {
    this.http
      .get<car[]>('http://127.0.0.1:3000/garage')
      .subscribe((res) => (this.cars = res));
  }
  createCar(body: createCar) {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.http
      .post('http://127.0.0.1:3000/garage', body, { headers })
      .subscribe((res) => {
        this.getCars();
        console.log(res);
      });
  }

  deleteCar(id: number) {
    this.http.delete(`http://127.0.0.1:3000/garage/${id}`).subscribe((res) => {
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
        `http://127.0.0.1:3000/garage/${car.id}`,
        { color: car.color, name: car.name },
        { headers }
      )
      .subscribe((res) => {
        this.getCars();
        console.log(res);
      });
  }

  startStopCar(car: car): Observable<carSpecs> {
    return this.http.patch<carSpecs>(
      `http://127.0.0.1:3000/garage/?id=${car.id}&status=started`,
      {}
    );
  }
}
