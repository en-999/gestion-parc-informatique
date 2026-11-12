import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-settings',
  imports: [RouterLink],
  template: `
    <main class="settings-page">
      <header class="settings-page-header">
        <div>
          <p class="eyebrow">CONFIGURATION</p>
          <h1>Paramètres</h1>
          <p class="settings-subtitle">Gérez les comptes et les paramètres de votre espace.</p>
        </div>
        <button class="back-button" type="button" routerLink="/">← Retour au parc</button>
      </header>

      <section class="settings-grid" aria-label="Paramètres de l’application">
        <article class="settings-card">
          <span class="settings-card-icon" aria-hidden="true">♙</span>
          <div>
            <h2>Compte utilisateur</h2>
            <p>Gérez les comptes autorisés à accéder au parc informatique.</p>
            <button type="button" class="settings-link" disabled>
              Gérer les comptes bientôt disponible
            </button>
          </div>
        </article>
        <article class="settings-card">
          <span class="settings-card-icon" aria-hidden="true">◷</span>
          <div>
            <h2>Session</h2>
            <p>La session reste active pendant 14 jours après la connexion.</p>
          </div>
        </article>
        <article class="settings-card settings-danger">
          <span class="settings-card-icon" aria-hidden="true">↪</span>
          <div>
            <h2>Déconnexion</h2>
            <p>Fermez votre session sur cet appareil.</p>
            <button class="logout-button" type="button" (click)="logout()">Se déconnecter</button>
          </div>
        </article>
      </section>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    if (!window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      return;
    }

    this.authService.logout().subscribe({
      next: () => this.redirectToLogin(),
      error: () => this.redirectToLogin()
    });
  }

  private redirectToLogin(): void {
    void this.router.navigateByUrl('/').then(() => window.location.reload());
  }
}
