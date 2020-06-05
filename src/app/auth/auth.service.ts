import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {Router} from '@angular/router';
import {BackendConst} from '../backend-const';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient,
                private router: Router) {
    }

    token = new BehaviorSubject<{ token: string }>(null);
    greska = new Subject<string>();

    signup(email: string, password: string) {
        return this.http.post<{ token: string }>(BackendConst.backendAddress + '/api/auth/signup', {email, password});
    }

    login(email: string, password: string) {
        this.http.post<{ authenticationToken: string, refresh: string, expiresAt: string, email: string }>(BackendConst.backendAddress + '/api/auth/login', {email, password})
            .subscribe(podaci => {
                console.log( podaci);
                console.log(podaci.authenticationToken);
                const t = podaci.authenticationToken;
                this.token.next({token: t});
                localStorage.setItem('userToken', podaci.authenticationToken);
                this.router.navigate(['/']);
            }, error => {
                console.log(error.error.poruka);
                this.greska.next('Uneti podaci nisu dobri');
            });
    }

    logout() {
        this.token.next(null);
        localStorage.removeItem('userToken');
        this.router.navigate(['/auth']);
    }

    autoLogin() {
        const token = localStorage.getItem('userToken');
        console.log('token: ' + token);
        if (!token) {
            return;
        }
        this.token.next({token});
    }
}
