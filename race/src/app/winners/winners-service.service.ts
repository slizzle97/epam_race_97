import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortModes, Winners, winnerCarData } from '../../model/winners.model';
import { GarageService } from '../garage/garage-service.service';
import { BehaviorSubject, take } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class WinnersService {
  constructor(private http: HttpClient, private garageService: GarageService) {}

  domainURL: string = 'http://127.0.0.1:3000';

  winnersFullData: winnerCarData[] = [];

  currentPage: number = 1;
  winnersPerPage: number = 10;
  totalWinners: number = 0;
  totalPages: number = 0;
  winnersOnPage: winnerCarData[] = [];

  private sortModeSub = new BehaviorSubject<SortModes>({
    wins: false,
    time: false,
    id: false,
  });
  public sortMode$ = this.sortModeSub.asObservable();

  changeSortMode(sortName: keyof SortModes) {
    this.sortModeSub.pipe(take(1)).subscribe((currentSortMode) => {
      const newSortMode: SortModes = { ...currentSortMode };
      newSortMode[sortName] = !newSortMode[sortName];
      this.sortModeSub.next(newSortMode);
    });
  }

  getWinners(sort?: keyof SortModes, order?: string) {
    this.http
      .get<Winners[]>(
        `${this.domainURL}/winners/?_page=${this.currentPage}&_limit=${
          this.winnersPerPage
        }
      ${sort ? '&_sort=' + sort : ''}${order ? '&_order=' + order : ''}`,
        { observe: 'response' }
      )
      .subscribe((res) => {
        this.totalWinners = Number(res.headers.get('X-Total-Count'));
        this.totalPages = Math.ceil(this.totalWinners / this.winnersPerPage);
        this.winnersFullData = this.garageService.cars
          .map((car) => {
            const winnerData = res.body?.find((winner) => winner.id === car.id);
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
}
