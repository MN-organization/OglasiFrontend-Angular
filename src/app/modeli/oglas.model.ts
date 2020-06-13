import {Slika} from './slika.model';

export class OglasModel {
    id: number;
    naslov: string;
    opis: string;
    cena: number;
    marka: string;
    model: string;
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
