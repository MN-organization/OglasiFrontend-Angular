import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BackendConst} from '../backend-const';
import {map} from 'rxjs/operators';
import {Gorivo} from '../modeli/gorivo.model';

@Injectable({
    providedIn: 'root'
})
export class GorivoService {

    constructor(private http: HttpClient) {
    }

    getGoriva() {
        return this.http.get<{ goriva: Gorivo[], poruka: string }>(BackendConst.backendAddress + '/api/goriva')
            .pipe(map(podaci => {
                return podaci.goriva;
            }));
    }
}
