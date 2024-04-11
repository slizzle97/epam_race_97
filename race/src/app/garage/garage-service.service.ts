import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface car {
  name: string;
  color: string;
  id: number;
}
interface createCar {
  name: string;
  color: string;
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
      .subscribe((res) => console.log(res));
  }
}
