import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, Input } from '@angular/core';
import { FormGroup, AbstractControl, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  createOutline,
  checkmarkCircle,
  warning,
  cashOutline,
  timeOutline,
  documentTextOutline,
  powerOutline,
  wifiOutline,
  waterOutline,
  lockClosedOutline,
  printOutline,
  bookOutline,
  personOutline,
} from 'ionicons/icons';

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class PreviewComponent implements OnInit {
  @Input() showRegistrationHeader = true;
  lrfService = inject(LibraryRegistrationFormService);
  private router = inject(Router);
  public mainForm!: FormGroup;

  public readonly pageTitle = 'Preview & Submit';
  public readonly subTitle = 'Review and submit your registration';
  public readonly pageDescription =
    'This is how your library profile will appear to students. Review all sections and make any necessary edits.';
  public readonly registrationStatusTitle = 'Registration Status';
  public readonly amenitiesLabels: { [key: string]: string } = {
    highSpeedWifi: 'High-Speed Wi-Fi',
    airConditioning: 'Air Conditioning',
    powerOutlets: 'Power Outlets',
    coffeeMachine: 'Coffee Machine',
    waterCooler: 'Water Cooler',
    parkingAvailable: 'Parking Available',
    security247: '24/7 Security',
    cctvSurveillance: 'CCTV Surveillance',
    lockers: 'Lockers',
    printingServices: 'Printing Services',
    quietZones: 'Quiet Zones',
    discussionRooms: 'Discussion Rooms',
  };
  public readonly bookCategoriesLabels: { [key: string]: string } = {
    engineeringTechnology: 'Engineering & Technology',
    medicalSciences: 'Medical Sciences',
    managementBusiness: 'Management & Business',
    artsLiterature: 'Arts & Literature',
    scienceMathematics: 'Science & Mathematics',
    competitiveExams: 'Competitive Exams (JEE, NEET, etc.)',
    governmentJobExams: 'Government Job Exams',
    languageCommunication: 'Language & Communication',
    computerScienceIT: 'Computer Science & IT',
    generalKnowledge: 'General Knowledge',
    fictionNovels: 'Fiction & Novels',
    referenceBooks: 'Reference Books',
  };

  constructor() {
    addIcons({
      createOutline,
      checkmarkCircle,
      warning,
      cashOutline,
      timeOutline,
      documentTextOutline,
      powerOutline,
      wifiOutline,
      waterOutline,
      lockClosedOutline,
      printOutline,
      bookOutline,
      personOutline,
    });
  }

  ngOnInit() {
    this.mainForm = this.lrfService.mainForm;
    console.info('mainForm', this.mainForm.value);
  }

  // Helper to get a specific section's FormGroup
  getSection(name: string): AbstractControl | null {
    return this.mainForm.get(name);
  }
  getSectionAsFormGroup(name: string): FormGroup {
    return this.mainForm.get(name) as FormGroup;
  }
  asFormArray(control: AbstractControl | null): FormArray {
    return control as FormArray;
  }

  // Filters an object (like amenities) to return an array of keys where the value is true
  getTrueKeys(groupName: string): string[] {
    const group = this.getSection(groupName);
    if (!group || !group.value) return [];
    return Object.keys(group.value).filter((key) => group.value[key]);
  }

  // Navigation helper
  navigateToSection(sectionIndex: number): void {
    this.lrfService.goToStep(sectionIndex);
    // You might need to adjust the route based on your app's routing setup
    this.router.navigate(['/library-registration-form']);
  }
}
