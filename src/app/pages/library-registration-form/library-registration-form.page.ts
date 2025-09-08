import { Component, computed, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Import necessary Ionic Standalone Components
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonProgressBar,
} from '@ionic/angular/standalone';

// Import your child components
import { BasicInformationComponent } from './components/basic-information/basic-information.component';
import { HostProfileComponent } from './components/host-profile/host-profile.component';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  peopleOutline,
  warningOutline,
  wifiOutline,
  checkmarkCircleOutline,
  arrowBack,
  arrowForward,
  checkmarkDoneOutline,
  businessOutline,
  documentLockOutline,
  imageOutline,
  documentOutline,
} from 'ionicons/icons';
import { AmenitiesComponent } from './components/amenities/amenities.component';
import { BookCollectionComponent } from './components/book-collection/book-collection.component';
import { LibraryImagesComponent } from './components/library-images/library-images.component';
import { PreviewComponent } from './components/preview/preview.component';
import { SeatManagementComponent } from './components/seat-management/seat-management.component';
import { PricingPlansComponent } from './components/pricing-plans/pricing-plans.component';
import { CodeOfConductComponent } from './components/code-of-conduct/code-of-conduct.component';
import { RequirementsComponent } from './components/requirements/requirements.component';

@Component({
  selector: 'app-library-registration-form',
  standalone: true,
  imports: [
    CommonModule,
    BaseUiComponents,
    BasicInformationComponent,
    HostProfileComponent,
    AmenitiesComponent,
    BookCollectionComponent,
    LibraryImagesComponent,
    PreviewComponent,
    SeatManagementComponent,
    PricingPlansComponent,
    CodeOfConductComponent,
    RequirementsComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButton,
    IonIcon,
    IonButtons,
    IonProgressBar,
  ],
  templateUrl: './library-registration-form.page.html',
  styleUrls: ['./library-registration-form.page.scss'],
})
export class LibraryRegistrationFormPage {
  pageTitle = 'Register your library';
  sections = [
    { id: 'basicInformation', icon: 'business-outline', label: 'Basic Info' },
    { id: 'hostProfile', icon: 'person-outline', label: 'Host Profile' },
    { id: 'libraryImages', icon: 'image-outline', label: 'Images' },
    { id: 'bookCollection', icon: 'book-outline', label: 'Book Collection' },
    { id: 'amenities', icon: 'wifi-outline', label: 'Amenities' },
    { id: 'seatManagement', icon: 'people-outline', label: 'Seating' },
    { id: 'pricingPlans', icon: 'cash-outline', label: 'Pricing' },
    { id: 'requirements', icon: 'document-outline', label: 'Requirements' },
    { id: 'codeOfConduct', icon: 'document-lock-outline', label: 'Conduct Code' },
    { id: 'preview', icon: 'eye-outline', label: 'Preview & Submit' },
  ];
  currentSectionIndex = signal(0);
  maxReachedIndex = signal(0);
  masterForm = new FormBuilder().group({});
  currentSectionId = computed(() => this.sections[this.currentSectionIndex()].id);

  progress = computed(() => {
    // FIX: Assert the type of the array to AbstractControl[]
    const controls = Object.values(this.masterForm.controls) as AbstractControl[];
    const completedSections = controls.filter((control) => control.valid).length;
    const totalFormSections = this.sections.length - 1; // Exclude summary
    if (totalFormSections <= 0) return 0;
    return completedSections / totalFormSections;
  });

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      arrowBack,
      arrowForward,
      checkmarkDoneOutline,
      eyeOutline,
      warningOutline,
      peopleOutline,
      wifiOutline,
      businessOutline,
      documentLockOutline,
      imageOutline,
      documentOutline,
    });
  }

  /**
   * Called by child components when they are ready, passing up their FormGroup.
   * FIX 2: Accept 'unknown' and use a type guard to ensure safety.
   */
  addSectionForm(name: string, group: unknown) {
    if (group instanceof FormGroup) {
      this.masterForm.addControl(name, group);
    } else {
      console.error('Error: A non-FormGroup value was emitted for section:', name);
    }
  }

  onSegmentChange(event: any) {
    const newIndex = this.sections.findIndex((s) => s.id === event.detail.value);
    if (newIndex <= this.maxReachedIndex()) {
      this.currentSectionIndex.set(newIndex);
    }
  }

  nextSection() {
    if (this.isCurrentSectionValid() && this.currentSectionIndex() < this.sections.length - 1) {
      const newIndex = this.currentSectionIndex() + 1;
      this.currentSectionIndex.set(newIndex);
      this.maxReachedIndex.set(Math.max(this.maxReachedIndex(), newIndex));
    }
  }

  prevSection() {
    if (this.currentSectionIndex() > 0) {
      this.currentSectionIndex.set(this.currentSectionIndex() - 1);
    }
  }

  isCurrentSectionValid(): boolean {
    const currentId = this.currentSectionId();
    // return this.masterForm.get(currentId)?.valid ?? false;
    return true;
  }

  isSectionComplete(sectionId: string): boolean {
    return this.masterForm.get(sectionId)?.valid ?? false;
  }

  onSubmit() {
    if (this.masterForm.valid) {
      console.log('Final Form Data:', this.masterForm.value);
      alert('Registration Submitted!');
    } else {
      console.error('Form is invalid', this.masterForm);
      alert('Please complete all required sections.');
    }
  }
}
