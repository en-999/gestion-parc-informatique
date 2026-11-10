import { Component } from '@angular/core';
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
  newEquipment: Omit<Equipment, 'id'> = this.emptyEquipment();
  loading = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly equipmentService: EquipmentService) {
    this.loadEquipments();
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
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Impossible d’enregistrer l’équipement.';
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
}
