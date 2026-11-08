import { Component } from '@angular/core';
import { Equipment } from './equipment';
import { EquipmentService } from './equipment.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  equipments: Equipment[] = [];
  loading = true;
  errorMessage = '';

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

  deleteEquipment(id: number): void {
    this.equipmentService.delete(id).subscribe({
      next: () => {
        this.equipments = this.equipments.filter((equipment) => equipment.id !== id);
      },
      error: () => {
        this.errorMessage = 'La suppression de l’équipement a échoué.';
      }
    });
  }
}
