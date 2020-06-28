import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {OglasModel} from '../../modeli/oglas.model';
import {OglasiService} from '../oglasi.service';
import {AuthService} from '../../auth/auth.service';

declare var paypal;

@Component({
    selector: 'app-oglas-element',
    templateUrl: './oglas-element.component.html',
    styleUrls: ['./oglas-element.component.scss'],
})
export class OglasElementComponent implements OnInit {

    @Input() public oglas: OglasModel;

    @Input() isMyOglas;

    isSacuvan = false;

    @ViewChild('paypal', {static: true}) paypalElement: ElementRef;

    prikaziPaypal = false;

    isLoading = false;

    constructor(private oglasiService: OglasiService,
                private authService: AuthService) {
    }

    ngOnInit() {
        this.isSacuvan = this.oglas.sacuvan;

        paypal
            .Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                description: 'obnova bas super oglas',
                                amount: {
                                    currency_code: 'USD',
                                    value: 2
                                }
                            }
                        ]
                    });
                },
                onApprove: async (data, actions) => {
                    // console.log(data);
                    // console.log(actions);
                    // this.isLoading = true;
                    // // const order = await actions.order.capture();//radimo capture na beku

                    // // console.log(order);
                    this.isLoading = true;
                    this.oglasiService.obnoviOglas(this.oglas, data.orderID)
                        .subscribe(poruka => {
                            if (poruka === 'Oglas uspesno obnovljen!') {
                                this.oglas.aktivan = true;
                            }
                            this.isLoading = false;
                        });
                },
                onError: err => {
                    console.log(err);
                    this.isLoading = false;
                }
            })
            .render(this.paypalElement.nativeElement);
    }

    onEdit(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    onDelete(e) {
        e.stopPropagation();
        e.preventDefault();
        this.oglasiService.delete(this.oglas.id);
    }

    onSacuvaj(e) {
        e.stopPropagation();
        e.preventDefault();
        if (!this.isSacuvan) {
            this.oglasiService.sacuvajOglas(this.oglas.id);
        } else {
            this.oglasiService.izbrisiSacuvanOglas(this.oglas.id);
        }
        this.isSacuvan = !this.isSacuvan;
    }

    onObnova(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        this.prikaziPaypal = !this.prikaziPaypal;
    }
}
