import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Marka} from '../modeli/marka.model';
import {BackendConst} from '../backend-const';
import {map} from 'rxjs/operators';
import {Menjac} from '../modeli/menjac.model';

@Injectable({
  providedIn: 'root'
})
export class MenjacService {

  constructor(private http: HttpClient) {
  }
  getMenjaci() {
    return this.http.get<{ menjaci: Menjac[], poruka: string }>(BackendConst.backendAddress + '/api/menjaci')
        .pipe(map(podaci => {
          return podaci.menjaci;
        }));
  }
}
