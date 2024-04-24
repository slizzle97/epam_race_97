import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { animatedCarI, car, createCar } from '../../model/race.model';
import { carMarks, carModels } from '../../json/car-marks';
@Injectable({ providedIn: 'root' })
export class GarageService {
  constructor(private http: HttpClient) {}

  cars: car[] = [];
  currentPage: number = 1;
  carsPerPage: number = 7;
  totalCars: number = 0;
  totalPages: number = 0;
  domainURL: string = 'http://127.0.0.1:3000';
  carMarks: string[] = carMarks;
  carModels: { [brand: string]: string[] } = carModels;

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
    const brandPart = this.generateRandomEl(carMarks);
    const modelsForBrand = this.carModels[brandPart];
    const modelPart = this.generateRandomEl(modelsForBrand);
    return `${brandPart} ${modelPart}`;
  }

  detectPageChange() {
    this.pageChangeSub.next(!this.pageChangeSub.value);
  }
  getCars(fromWinner?: boolean) {
    const url = fromWinner
      ? `${this.domainURL}/garage/`
      : `${this.domainURL}/garage/?_page=${this.currentPage}&_limit=${this.carsPerPage}`;
    this.http.get<car[]>(url, { observe: 'response' }).subscribe((res) => {
      this.totalCars = Number(res.headers.get('X-Total-Count'));
      this.totalPages = Math.ceil(this.totalCars / this.carsPerPage);
      if (res.body) {
        this.cars = res.body.map((car) => ({ ...car, disabled: true }));
        setTimeout(() => {
          this.detectPageChange();
        }, 0);
      }
    });
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
  deleteWinner(id: number) {
    this.http.delete(`${this.domainURL}/winners/${id}`).subscribe();
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
