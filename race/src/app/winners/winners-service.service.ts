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
    wins: null,
    time: null,
    id: null,
  });
  public sortMode$ = this.sortModeSub.asObservable();

  changeSortMode(sortName: keyof SortModes) {
    // check sort values(possible options: null, true, false), if one changes, other reset to default value, which is null.
    this.sortModeSub.pipe(take(1)).subscribe((currentSortMode) => {
      const newSortMode: SortModes = { ...currentSortMode };
      if (
        newSortMode[sortName] === null ||
        newSortMode[sortName] !== !newSortMode[sortName]
      ) {
        newSortMode[sortName] =
          newSortMode[sortName] === null ? true : !newSortMode[sortName];

        Object.keys(newSortMode).forEach((key) => {
          if (key !== sortName) {
            newSortMode[key] = null;
          }
        });

        this.sortModeSub.next(newSortMode);
      }
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
        // we could reverse mapping and  map through garageService.cars and find in res.body, but that would disarrange sorted data. this way, we map through sorted array, still get sorted result in winnersFullData
        if (res.body)
          this.winnersFullData = res.body
            .map((winner) => {
              const car = this.garageService.cars.find(
                (car) => car.id === winner.id
              );
              return car
                ? { ...car, time: winner.time, wins: winner.wins }
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

      // check if service returns empty array, meaning can has never won yet, so we create a winner, or returning array of object, therefore updating its wins and time if improved
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

  sortWinners(sortName?: keyof SortModes) {
    //1. if sortName is passed(options: id, wins, time), it changes state of subject with same name, from inital state of null, to false or true(toggleable).
    //2. We then subscribe to the sortMode$ observable and filter out the properties with non-null values.If there are non-null sort modes, we choose the first one encountered and pass it to getWinners along with 'asc' or 'desc' argument.
    //3. if all sortModes are null, we call getWinners with no arguments that returns unordered data.
    if (sortName) {
      this.changeSortMode(sortName);
    }
    this.sortMode$.pipe(take(1)).subscribe((sortMode: SortModes) => {
      const nonNullSortModes = Object.entries(sortMode).filter(
        ([, value]) => value !== null
      );
      if (nonNullSortModes.length > 0) {
        const firstNonNullSortMode = nonNullSortModes[0][0] as keyof SortModes;
        this.getWinners(
          firstNonNullSortMode,
          sortMode[firstNonNullSortMode] ? 'ASC' : 'DESC'
        );
      } else {
        this.getWinners();
      }
    });
  }
}
