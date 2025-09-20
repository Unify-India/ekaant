import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { warningOutline, wifiOutline } from 'ionicons/icons';

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';
@Component({
  selector: 'app-amenities',
  templateUrl: './amenities.component.html',
  styleUrls: ['./amenities.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class AmenitiesComponent implements OnInit {
  private lrfService = inject(LibraryRegistrationFormService);
  public amenitiesForm!: FormGroup;

  // --- String Variables for the Template ---
  public readonly pageTitle = 'Amenities';
  public readonly sectionDescription =
    'Select all the facilities and amenities available at your library. This helps students choose the right library for their needs.';
  public readonly completionWarning = 'This section needs to be completed';
  public readonly selectPrompt = 'Select the amenities available at your library';

  // --- Data for Rendering Checkboxes ---
  public readonly amenities = [
    { formControlName: 'highSpeedWifi', label: 'High-Speed Wi-Fi' },
    { formControlName: 'airConditioning', label: 'Air Conditioning' },
    { formControlName: 'powerOutlets', label: 'Power Outlets' },
    { formControlName: 'coffeeMachine', label: 'Coffee Machine' },
    { formControlName: 'waterCooler', label: 'Water Cooler' },
    { formControlName: 'parkingAvailable', label: 'Parking Available' },
    { formControlName: 'security247', label: '24/7 Security' },
    { formControlName: 'cctvSurveillance', label: 'CCTV Surveillance' },
    { formControlName: 'lockers', label: 'Lockers' },
    { formControlName: 'printingServices', label: 'Printing Services' },
    { formControlName: 'quietZones', label: 'Quiet Zones' },
    { formControlName: 'discussionRooms', label: 'Discussion Rooms' },
  ];

  constructor() {
    addIcons({ warningOutline, wifiOutline });
  }

  ngOnInit() {
    this.amenitiesForm = this.lrfService.getFormGroup('amenities');
  }
}
