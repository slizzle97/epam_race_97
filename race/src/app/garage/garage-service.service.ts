import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { animatedCarI, car, createCar } from '../../model/race.model';

@Injectable({ providedIn: 'root' })
export class GarageService {
  constructor(private http: HttpClient) {}

  cars: car[] = [];

  domainURL: string = 'http://127.0.0.1:3000';
  brandParts: string[] = [
    'Tesla',
    'Ford',
    'Chevrolet',
    'Toyota',
    'Honda',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Volkswagen',
    'Nissan',
  ];
  modelParts: string[] = [
    'Model S',
    'Mustang',
    'Camaro',
    'Corolla',
    'Accord',
    'X5',
    'E-Class',
    'A7',
    'Golf',
    'Altima',
  ];

  private pageChangeSub = new BehaviorSubject<boolean>(false);
  public pageChange$ = this.pageChangeSub.asObservable();

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  generateRandomEl(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }
  generateRandomCar() {
    const brandPart = this.generateRandomEl(this.brandParts);
    const modelPart = this.generateRandomEl(this.modelParts);
    return `${brandPart} ${modelPart}`;
  }
  onPagechange() {
    this.pageChangeSub.next(!this.pageChangeSub.value);
  }

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
      .post(`${this.domainURL}/garage`, body, { headers })
      .subscribe(() => {
        this.getCars();
      });
  }

  deleteCar(id: number) {
    this.http.delete(`${this.domainURL}/garage/${id}`).subscribe(() => {
      this.getCars();
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
      .subscribe(() => {
        this.getCars();
      });
  }

  carAction<U>(car: car | animatedCarI, driveMode: string): Observable<U> {
    return this.http.patch(
      `${this.domainURL}/engine/?id=${car.id}&status=${driveMode}`,
      {}
    ) as Observable<U>;
  }
}
