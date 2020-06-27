import {Slika} from './slika.model';
import {Marka} from './marka.model';
import {Model} from './model.model';
import {Gorivo} from './gorivo.model';
import {Menjac} from './menjac.model';

export class OglasModel {
    id: number;
    naslov: string;
    opis: string;
    cena: number;
    // marka: Marka;
    model: Model;
    godiste: number;
    kilometraza: number;
    gorivo: Gorivo;
    snaga: number;
    kubikaza: number;
    menjac: Menjac;
    slike: Slika[];
    sacuvan = false;

    constructor() {
    }

}
