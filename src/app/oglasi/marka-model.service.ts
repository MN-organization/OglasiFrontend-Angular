import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BackendConst} from '../backend-const';
import {Marka} from '../modeli/marka.model';
import {Model} from '../modeli/model.model';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class MarkaModelService {

    constructor(private http: HttpClient) {
    }

    getAll() {
        // return this.marke;
        // if (this.marke.length === 0) {
            return this.http.get<{ marke: Marka[], poruka: string }>(BackendConst.backendAddress + '/api/markaModel')
                .pipe(map(podaci => {
                    return podaci.marke;
                }));
                // .subscribe(podaci => {
                //     console.log(podaci);
                //     this.marke = podaci.marke;
                //     console.log(this.marke);
                //     return this.marke;
                // });
        // } else {
        //     console.log('else');
        //     console.log(this.marke);
        //     return this.marke;
        // }
    }

    getModeliZaMarku(id: number) {
         return this.http.get<{modeli: Model[], poruka: string}>(BackendConst.backendAddress + '/api/markaModel/' + id)
             .pipe(map(podaci => {
                 return podaci.modeli;
             }));
    }
}
