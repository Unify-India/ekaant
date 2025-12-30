import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { construct, ellipsisVertical, ellipse, personCircle, closeCircle } from 'ionicons/icons';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ILibrary, ISeat } from 'src/app/models/library.interface';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-slot-management',
  templateUrl: './slot-management.page.html',
  styleUrls: ['./slot-management.page.scss'],
  standalone: true,
  imports: [IonIcon, IonChip, IonLabel, IonButton, BaseUiComponents, UiEssentials, CommonModule],
})
export class SlotManagementPage implements OnInit {
  seats: ISeat[] = [];

  statusDetails: any = {
    active: { label: 'Available', icon: 'ellipse', color: 'success' },
    occupied: { label: 'Occupied', icon: 'person-circle', color: 'primary' },
    maintenance: { label: 'Maintenance', icon: 'construct', color: 'warning' },
    disabled: { label: 'Disabled', icon: 'close-circle', color: 'medium' },
  };

  constructor(private authService: AuthService) {
    addIcons({ ellipse, personCircle, construct, ellipsisVertical, closeCircle });
  }

  ngOnInit() {
    this.loadSeats();
  }

  loadSeats() {
    const user = this.authService.getCurrentUser();
    if (user && user.primaryLibraryId) {
      const managedLibrariesStr = localStorage.getItem('managedLibraries');
      if (managedLibrariesStr) {
        try {
          const libraries: ILibrary[] = JSON.parse(managedLibrariesStr);
          const primaryLib = libraries.find((l) => l.id === user.primaryLibraryId);
          if (primaryLib && primaryLib.seatManagement && primaryLib.seatManagement.seats) {
            this.seats = primaryLib.seatManagement.seats;
          }
        } catch (e) {
          console.error('Error parsing managed libraries from local storage', e);
        }
      }
    }
  }

  getAmenities(seat: ISeat): string[] {
    const amenities = [];
    if (seat.isAC) amenities.push('AC');
    if (seat.hasPower) amenities.push('Power Outlet');
    // Default amenities can be added here if needed
    if (amenities.length === 0) amenities.push('Standard');
    return amenities;
  }

  manageSlot(seat: ISeat) {
    console.log('Manage seat', seat.id, seat);
    // TODO: Implement navigation, modal, or popover to edit status/details
  }

  moreActions(seat: ISeat, event: Event) {
    event.stopPropagation();
    console.log('More actions for', seat.id);
    // TODO: Show popover or action sheet
  }
}
