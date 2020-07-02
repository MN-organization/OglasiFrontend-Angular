import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {Router} from '@angular/router';
import {BackendConst} from '../backend-const';
import * as jwt_decode from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient,
                private router: Router) {
    }

    token = new BehaviorSubject<{ token: string }>(null);
    refreshToken = new BehaviorSubject<{ refreshToken: string }>(null);
    greska = new Subject<string>();

    signup(email: string, password: string) {
        return this.http.post<{ poruka: string }>(BackendConst.backendAddress + '/api/auth/signup', {email, password});
    }

    login(email: string, password: string) {
        this.http.post<{ authenticationToken: string, refreshToken: string, expiresAt: string, email: string }>(BackendConst.backendAddress + '/api/auth/login', {
            email,
            password
        })
            .subscribe(podaci => {
                console.log(podaci);
                console.log(podaci.authenticationToken);
                const t = podaci.authenticationToken;
                this.token.next({token: t});
                this.refreshToken.next({refreshToken: podaci.refreshToken});
                localStorage.setItem('refreshToken', podaci.refreshToken);
                console.log('refresh ' + podaci.refreshToken);
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
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/auth']);
    }

    autoLogin() {
        const token = localStorage.getItem('userToken');
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('token: ' + token);
        if (!token) {
            return;
        }
        this.token.next({token});
        this.refreshToken.next({refreshToken});
    }


    refresujToken() {
        if (this.token.getValue() && this.refreshToken.getValue()) {
            const t = jwt_decode(this.token.getValue().token);
            const exp = t.exp * 1000;
            if (exp + 1800000 > new Date().getTime()) {
                this.http.get<{ authenticationToken: string, refreshToken: string, expiresAt: string, email: string }>(BackendConst.backendAddress + '/api/auth/refresh/token/' + this.refreshToken.getValue().refreshToken)
                    .subscribe(podaci => {
                        console.log(podaci);
                        this.token.next({token: podaci.authenticationToken});
                        this.refreshToken.next({refreshToken: podaci.refreshToken});
                        localStorage.setItem('refreshToken', podaci.refreshToken);
                        localStorage.setItem('userToken', podaci.authenticationToken);
                    });
            }
        }
    }

    isTokenExpired() {
        if (this.token.getValue() && this.refreshToken.getValue()) {
            const t = jwt_decode(this.token.getValue().token);
            const exp = t.exp * 1000;
            if (exp < new Date().getTime()) {
                this.token.next(null);
                localStorage.removeItem('userToken');
            }
        }
    }
}
