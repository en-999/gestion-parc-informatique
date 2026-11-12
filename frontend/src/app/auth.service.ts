import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

export interface AuthUser {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly authenticationState = new Subject<boolean>();
  readonly authenticationState$ = this.authenticationState.asObservable();

  login(username: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(
      `${this.apiUrl}/login`,
      { username, password },
      { withCredentials: true }
    ).pipe(tap(() => this.authenticationState.next(true)));
  }

  register(username: string, password: string, passwordConfirmation: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(
      `${this.apiUrl}/register`,
      { username, password, passwordConfirmation },
      { withCredentials: true }
    ).pipe(tap(() => this.authenticationState.next(true)));
  }

  currentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap({
        next: () => this.authenticationState.next(false),
        error: () => this.authenticationState.next(false)
      })
    );
  }
}
