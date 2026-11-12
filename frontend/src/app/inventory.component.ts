import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Equipment } from './equipment';
import { EquipmentService } from './equipment.service';

@Component({
  selector: 'app-inventory',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <main class="inventory-page">
      <header class="inventory-page-header">
        <div>
          <p class="eyebrow">GESTION · PARC INFORMATIQUE</p>
          <h1>Inventaire des équipements</h1>
          <p class="subtitle">Consultez l’ensemble des équipements enregistrés dans le parc informatique.</p>
        </div>
        <button class="back-button" type="button" routerLink="/">← Retour au tableau de bord</button>
      </header>

      <section class="panel inventory-panel" aria-labelledby="inventory-title">
        <div class="panel-header">
          <div>
            <h2 id="inventory-title">Inventaire</h2>
            <p class="inventory-count">{{ filteredEquipments.length }} équipement{{ filteredEquipments.length > 1 ? 's' : '' }}</p>
          </div>
          <button type="button" class="refresh-button" (click)="loadEquipments()">Actualiser</button>
        </div>

        <div class="filters" role="search">
          <label>
            Rechercher
            <input
              type="search"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onFiltersChange()"
              placeholder="N° inventaire, nom ou type"
              aria-label="Rechercher un équipement"
            />
          </label>
          <label>
            Statut
            <select [(ngModel)]="statusFilter" (ngModelChange)="onFiltersChange()" aria-label="Filtrer par statut">
              <option value="">Tous les statuts</option>
              @for (status of statuses; track status) {
                <option [value]="status">{{ status }}</option>
              }
            </select>
          </label>
          @if (searchTerm || statusFilter) {
            <button type="button" class="clear-filters-button" (click)="clearFilters()">
              Réinitialiser
            </button>
          }
        </div>

        @if (loading) {
          <p class="message">Chargement des équipements…</p>
        } @else if (errorMessage) {
          <p class="message error" role="alert">{{ errorMessage }}</p>
        } @else if (equipments.length === 0) {
          <p class="message">Aucun équipement n'est encore enregistré.</p>
        } @else if (filteredEquipments.length === 0) {
          <p class="message">Aucun équipement ne correspond aux critères de recherche.</p>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>N° inventaire</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Provenance</th>
                  <th>Description</th>
                  <th>Enregistré le</th>
                </tr>
              </thead>
              <tbody>
                @for (equipment of paginatedEquipments; track equipment.id) {
                  <tr>
                    <td>{{ equipment.inventoryNumber }}</td>
                    <td>{{ equipment.name }}</td>
                    <td>{{ equipment.type }}</td>
                    <td><span class="status" [class]="statusClass(equipment.status)">{{ normalizeStatus(equipment.status) }}</span></td>
                    <td>{{ equipment.provenance || 'Non renseignée' }}</td>
                    <td>{{ equipment.description || 'Non renseignée' }}</td>
                    <td>{{ equipment.createdAt ? (equipment.createdAt | date: 'dd/MM/yyyy HH:mm:ss') : 'Non disponible' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (totalPages > 1) {
            <nav class="pagination" aria-label="Pagination des équipements">
              <button type="button" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
                Précédente
              </button>
              <span>Page {{ currentPage }} sur {{ totalPages }}</span>
              <button type="button" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
                Suivante
              </button>
            </nav>
          }
        }
      </section>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class InventoryComponent implements OnInit {
  private readonly equipmentService = inject(EquipmentService);

  equipments: Equipment[] = [];
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  readonly pageSize = 10;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadEquipments();
  }

  get filteredEquipments(): Equipment[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.equipments.filter((equipment) => {
      const matchesSearch = !search
        || [equipment.inventoryNumber, equipment.name, equipment.type, equipment.provenance || '', equipment.description || '']
          .some((value) => value.toLowerCase().includes(search));
      return matchesSearch && (!this.statusFilter || this.normalizeStatus(equipment.status) === this.statusFilter);
    });
  }

  get statuses(): string[] {
    return ['En panne', 'Hors service', 'Stock'].filter((status) =>
      this.equipments.some((equipment) => this.normalizeStatus(equipment.status) === status)
    );
  }

  normalizeStatus(status: string): string {
    return status.trim().toLowerCase() === 'en maintenance' ? 'En panne' : status;
  }

  statusClass(status: string): string {
    const normalizedStatus = this.normalizeStatus(status).trim().toLowerCase();
    return normalizedStatus === 'en panne'
      ? 'status-panne'
      : normalizedStatus === 'hors service'
        ? 'status-hors-service'
        : normalizedStatus === 'stock'
          ? 'status-stock'
          : '';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEquipments.length / this.pageSize));
  }

  get paginatedEquipments(): Equipment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEquipments.slice(start, start + this.pageSize);
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

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.onFiltersChange();
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }
}
