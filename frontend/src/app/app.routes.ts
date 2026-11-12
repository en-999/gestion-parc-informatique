import { Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { SettingsComponent } from './settings.component';

export const routes: Routes = [
  { path: 'inventory', component: InventoryComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
