import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Equipment } from './equipment';
import { EquipmentService } from './equipment.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  equipments: Equipment[] = [];
  searchTerm = '';
  statusFilter = '';
  newEquipment: Omit<Equipment, 'id'> = this.emptyEquipment();
  editingEquipmentId: number | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly equipmentService: EquipmentService) {
    this.loadEquipments();
  }

  get filteredEquipments(): Equipment[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.equipments.filter((equipment) => {
      const matchesSearch = !search
        || [equipment.inventoryNumber, equipment.name, equipment.type]
          .some((value) => value.toLowerCase().includes(search));
      const matchesStatus = !this.statusFilter || equipment.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get statuses(): string[] {
    return [...new Set(this.equipments.map((equipment) => equipment.status))]
      .sort((first, second) => first.localeCompare(second));
  }

  loadEquipments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.equipmentService.findAll().subscribe({
      next: (equipments) => {
        this.equipments = equipments;
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
    this.editingEquipmentId = equipment.id;
    this.newEquipment = {
      inventoryNumber: equipment.inventoryNumber,
      name: equipment.name,
      type: equipment.type,
      status: equipment.status
    };
    this.errorMessage = '';
    this.successMessage = '';
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
        this.errorMessage = this.getSaveErrorMessage(error, 'modifier');
      }
    });
  }

  deleteEquipment(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.equipmentService.delete(id).subscribe({
      next: () => {
        this.equipments = this.equipments.filter((equipment) => equipment.id !== id);
        this.successMessage = 'Équipement supprimé avec succès.';
      },
      error: () => {
        this.errorMessage = 'La suppression de l’équipement a échoué.';
      }
    });
  }

  private emptyEquipment(): Omit<Equipment, 'id'> {
    return {
      inventoryNumber: '',
      name: '',
      type: '',
      status: ''
    };
  }

  private getSaveErrorMessage(error: HttpErrorResponse, action = 'enregistrer'): string {
    if (error.status === 409) {
      return 'Ce numéro d’inventaire est déjà utilisé.';
    }
    return `Impossible de ${action} l’équipement.`;
  }
}
