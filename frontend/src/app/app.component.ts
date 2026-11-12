import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Equipment, EquipmentPayload } from './equipment';
import { EquipmentService } from './equipment.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly router = inject(Router);
  isAuthenticated = false;
  authChecking = true;
  loginUsername = '';
  loginPassword = '';
  loginError = '';
  registerMode = false;
  registerUsername = '';
  registerPassword = '';
  registerPasswordConfirmation = '';
  registerError = '';
  equipments: Equipment[] = [];
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  readonly pageSize = 10;
  readonly equipmentTypes = ['Ordinateur portable', 'Ordinateur de bureau', 'Écran', 'Imprimante', 'Serveur', 'Réseau', 'Autre'];
  readonly equipmentStatuses = ['En service', 'En maintenance', 'Hors service', 'Stock'];
  newEquipment: EquipmentPayload = this.emptyEquipment();
  editingEquipmentId: number | null = null;
  loading = true;
  submitting = false;
  deletingEquipmentId: number | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly authService: AuthService
  ) {
    this.authService.authenticationState$.subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.resetAuthentication();
      }
    });

    this.authService.currentUser().subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.authChecking = false;
        this.loadEquipments();
      },
      error: () => {
        this.authChecking = false;
      }
    });
  }

  login(): void {
    this.loginError = '';
    if (!this.loginUsername.trim() || !this.loginPassword) {
      this.loginError = 'Veuillez renseigner votre identifiant et votre mot de passe.';
      return;
    }

    this.authService.login(this.loginUsername, this.loginPassword).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.loadEquipments();
      },
      error: (error: HttpErrorResponse) => {
        this.loginError = error.status === 401
          ? 'Identifiant ou mot de passe invalide.'
          : 'La connexion est momentanément indisponible.';
      }
    });
  }

  register(): void {
    this.registerError = '';
    if (this.registerPassword !== this.registerPasswordConfirmation) {
      this.registerError = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.authService.register(
      this.registerUsername,
      this.registerPassword,
      this.registerPasswordConfirmation
    ).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.loadEquipments();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.registerError = 'Cet identifiant est déjà utilisé.';
        } else if (error.status === 400) {
          this.registerError = error.error?.detail || 'Vérifiez les informations saisies.';
        } else {
          this.registerError = 'L’inscription est momentanément indisponible.';
        }
      }
    });
  }

  switchAuthMode(): void {
    this.registerMode = !this.registerMode;
    this.loginError = '';
    this.registerError = '';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.resetAuthentication(),
      error: () => this.resetAuthentication()
    });
  }

  private resetAuthentication(): void {
    this.isAuthenticated = false;
    this.loginUsername = '';
    this.loginPassword = '';
    this.loginError = '';
    this.registerMode = false;
    this.registerUsername = '';
    this.registerPassword = '';
    this.registerPasswordConfirmation = '';
    this.registerError = '';
    this.equipments = [];
  }

  get filteredEquipments(): Equipment[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.equipments.filter((equipment) => {
      const matchesSearch = !search
        || [equipment.inventoryNumber, equipment.name, equipment.type, equipment.provenance || '']
          .some((value) => value.toLowerCase().includes(search));
      const matchesStatus = !this.statusFilter || equipment.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get statuses(): string[] {
    return [...new Set(this.equipments.map((equipment) => equipment.status))]
      .sort((first, second) => first.localeCompare(second));
  }

  get equipmentStats(): { label: string; value: number; tone: string }[] {
    return [
      { label: 'Total', value: this.equipments.length, tone: 'blue' },
      { label: 'En service', value: this.countByStatus('en service'), tone: 'green' },
      { label: 'En maintenance', value: this.countByStatus('maintenance'), tone: 'orange' },
      { label: 'Hors service', value: this.countByStatus('hors service'), tone: 'red' }
    ];
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEquipments.length / this.pageSize));
  }

  get paginatedEquipments(): Equipment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEquipments.slice(start, start + this.pageSize);
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  loadEquipments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.equipmentService.findAll().subscribe({
      next: (equipments) => {
        this.equipments = equipments;
        this.goToPage(this.currentPage);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les équipements. Vérifiez que le backend est démarré.';
      }
    });
  }

  createEquipment(): void {
    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.equipmentService.create(this.newEquipment).subscribe({
      next: (equipment) => {
        this.equipments = [...this.equipments, equipment];
        this.goToPage(this.currentPage);
        this.newEquipment = this.emptyEquipment();
        this.submitting = false;
        this.successMessage = 'Équipement enregistré avec succès.';
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = this.getSaveErrorMessage(error);
      }
    });
  }

  editEquipment(equipment: Equipment): void {
    if (this.submitting || this.deletingEquipmentId !== null) {
      return;
    }

    this.editingEquipmentId = equipment.id;
    this.newEquipment = {
      name: equipment.name,
      type: equipment.type,
      status: equipment.status,
      provenance: equipment.provenance ?? ''
    };
    this.errorMessage = '';
    this.successMessage = '';
    document.getElementById('equipment-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>('#equipment-form input[name="name"]')?.focus();
    }, 250);
  }

  cancelEdit(): void {
    this.editingEquipmentId = null;
    this.newEquipment = this.emptyEquipment();
    this.errorMessage = '';
  }

  updateEquipment(): void {
    if (this.editingEquipmentId === null) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.equipmentService.update(this.editingEquipmentId, this.newEquipment).subscribe({
      next: (equipment) => {
        this.equipments = this.equipments.map((item) => item.id === equipment.id ? equipment : item);
        this.editingEquipmentId = null;
        this.newEquipment = this.emptyEquipment();
        this.submitting = false;
        this.successMessage = 'Équipement modifié avec succès.';
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = error.status === 404
          ? 'Cet équipement n’existe plus dans la base de données.'
          : this.getSaveErrorMessage(error, 'modifier');
      }
    });
  }

  deleteEquipment(id: number): void {
    const equipment = this.equipments.find((item) => item.id === id);
    if (!equipment || !window.confirm(`Supprimer l’équipement « ${equipment.name} » ? Cette action est irréversible.`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingEquipmentId = id;
    this.equipmentService.delete(id).subscribe({
      next: () => {
        this.equipments = this.equipments.filter((equipment) => equipment.id !== id);
        if (this.editingEquipmentId === id) {
          this.editingEquipmentId = null;
          this.newEquipment = this.emptyEquipment();
        }
        this.goToPage(this.currentPage);
        this.deletingEquipmentId = null;
        this.successMessage = 'Équipement supprimé avec succès.';
      },
      error: (error: HttpErrorResponse) => {
        this.deletingEquipmentId = null;
        this.errorMessage = error.status === 404
          ? 'Cet équipement n’existe plus dans la base de données.'
          : 'La suppression de l’équipement a échoué.';
      }
    });
  }

  private emptyEquipment(): EquipmentPayload {
    return {
      name: '',
      type: '',
      status: '',
      provenance: ''
    };
  }

  private countByStatus(status: string): number {
    return this.equipments.filter((equipment) => equipment.status.trim().toLowerCase() === status).length;
  }

  private getSaveErrorMessage(error: HttpErrorResponse, action = 'enregistrer'): string {
    if (error.status === 409) {
      return 'Ce numéro d’inventaire est déjà utilisé.';
    }
    return `Impossible de ${action} l’équipement.`;
  }
}
