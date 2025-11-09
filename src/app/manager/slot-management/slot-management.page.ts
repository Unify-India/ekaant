import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLabel,
  IonNote,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { construct, ellipsisVertical, ellipse, personCircle } from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

interface Cubicle {
  amenities: string[];
  id: string;
  lastMaintenance: string;
  notes?: string;
  status: 'available' | 'occupied' | 'maintenance';
}

@Component({
  selector: 'app-slot-management',
  templateUrl: './slot-management.page.html',
  styleUrls: ['./slot-management.page.scss'],
  standalone: true,
  imports: [IonIcon, IonChip, IonLabel, IonButton, BaseUiComponents, UiEssentials],
})
export class SlotManagementPage {
  mockCubicles: Cubicle[] = [
    { id: 'C-01', amenities: ['Wi-Fi', 'AC', 'Power Outlet'], lastMaintenance: '2024-12-15', status: 'available' },
    { id: 'C-02', amenities: ['Wi-Fi', 'AC', 'Power Outlet'], lastMaintenance: '2025-01-01', status: 'maintenance' },
    { id: 'C-03', amenities: ['Wi-Fi', 'Power Outlet'], lastMaintenance: '2024-12-20', status: 'available' },
    { id: 'C-04', amenities: ['Wi-Fi', 'AC'], lastMaintenance: '2024-12-10', status: 'occupied' },
    { id: 'C-05', amenities: ['Wi-Fi', 'AC', 'Power Outlet'], lastMaintenance: '2024-12-18', status: 'available' },
    { id: 'C-06', amenities: ['Wi-Fi', 'Power Outlet'], lastMaintenance: '2024-12-22', status: 'available' },
  ];

  statusDetails = {
    available: { label: 'Available', icon: 'ellipse', color: 'success' },
    occupied: { label: 'Occupied', icon: 'person-circle', color: 'primary' },
    maintenance: { label: 'Maintenance', icon: 'construct', color: 'warning' },
  };

  constructor() {
    addIcons({ ellipse, personCircle, construct, ellipsisVertical });
  }

  manageSlot(cubicle: Cubicle) {
    console.log('Manage cubicle', cubicle.id, cubicle);
    // TODO: Implement navigation, modal, or popover to edit status/details
  }

  moreActions(cubicle: Cubicle, event: Event) {
    event.stopPropagation();
    console.log('More actions for', cubicle.id);
    // TODO: Show popover or action sheet
  }
}
