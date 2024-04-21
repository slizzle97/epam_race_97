import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Winners, winnerCarData } from '../../model/winners.model';
import { GarageService } from '../garage/garage-service.service';

@Injectable({ providedIn: 'root' })
export class WinnersService {
  constructor(private http: HttpClient, private garageService: GarageService) {}

  domainURL: string = 'http://127.0.0.1:3000';

  winners: Winners[] = [];
  winnersFullData: winnerCarData[] = [];
  getWinners(page?: number, limit?: number, sort?: string, order?: string) {
    this.http
      .get<Winners[]>(
        `${this.domainURL}/winners/?${page ? '_page=' + page : ''}${
          limit ? '&_limit=' + limit : ''
        }${sort ? '&_sort=' + sort : ''}${order ? '&_order=' + order : ''}`
      )
      .subscribe((res) => {
        this.winnersFullData = this.garageService.cars
          .map((car) => {
            const winnerData = res.find((winner) => winner.id === car.id);
            return winnerData
              ? { ...car, time: winnerData.time, wins: winnerData.wins }
              : undefined;
          })
          .filter((winner) => winner !== undefined) as winnerCarData[];
      });
  }

  createWinner(body: Winners) {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.http
      .post<Winners>(`${this.domainURL}/winners`, body, { headers })
      .subscribe();
  }
  getWinner(carID: number, time: number) {
    this.http
      .get<Winners[]>(`${this.domainURL}/winners/?id=${carID}`)

      .subscribe((res) => {
        if (res.length === 0) {
          const firstTimeWinner: Winners = { id: carID, wins: 1, time: time };
          this.createWinner(firstTimeWinner);
        } else {
          this.updateWinner(carID, {
            wins: res[0].wins + 1,
            time: time < res[0].time ? time : res[0].time,
          });
        }
      });
  }

  updateWinner(
    carID: number,
    body: {
      wins: number;
      time: number;
    }
  ) {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.http
      .put(`${this.domainURL}/winners/${carID}`, body, { headers })
      .subscribe();
  }

  currentPage: number = 1;
  winnersPerPage: number = 10;
  winnersOnPage: winnerCarData[] = [];
  getPaginatedWinners(): winnerCarData[] {
    const startIndex = (this.currentPage - 1) * this.winnersPerPage;
    const endIndex = startIndex + this.winnersPerPage;
    this.winnersOnPage = this.winnersFullData.slice(startIndex, endIndex);
    return this.winnersOnPage;
  }
  getTotalPages(): number {
    return Math.ceil(this.winnersFullData.length / this.winnersPerPage);
  }
}
