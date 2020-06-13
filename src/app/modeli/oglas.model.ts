import {Slika} from './slika.model';
import {Marka} from './marka.model';
import {Model} from './model.model';

export class OglasModel {
    id: number;
    naslov: string;
    opis: string;
    cena: number;
    // marka: Marka;
    model: Model;
    godiste: number;
    kilometraza: number;
    gorivo: string;
    snaga: number;
    kubikaza: number;
    menjac: string;
    slike: Slika[];
    sacuvan = false;

    constructor() {
    }

}
