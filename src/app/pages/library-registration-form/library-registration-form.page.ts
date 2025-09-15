import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonProgressBar,
  IonAlert,
} from '@ionic/angular/standalone';
import type { OverlayEventDetail } from '@ionic/core';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  peopleOutline,
  warningOutline,
  wifiOutline,
  checkmarkCircleOutline,
  arrowForward,
  checkmarkDoneOutline,
  businessOutline,
  documentLockOutline,
  imageOutline,
  documentOutline,
  chevronForward,
  chevronBack,
} from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

import { AmenitiesComponent } from './components/amenities/amenities.component';
import { BasicInformationComponent } from './components/basic-information/basic-information.component';
import { BookCollectionComponent } from './components/book-collection/book-collection.component';
import { CodeOfConductComponent } from './components/code-of-conduct/code-of-conduct.component';
import { HostProfileComponent } from './components/host-profile/host-profile.component';
import { LibraryImagesComponent } from './components/library-images/library-images.component';
import { PreviewComponent } from './components/preview/preview.component';
import { PricingPlansComponent } from './components/pricing-plans/pricing-plans.component';
import { RequirementsComponent } from './components/requirements/requirements.component';
import { SeatManagementComponent } from './components/seat-management/seat-management.component';
import { LibraryRegistrationFormService } from './service/library-registration-form.service';

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
    IonIcon,
    IonProgressBar,
    IonAlert,
  ],
  templateUrl: './library-registration-form.page.html',
  styleUrls: ['./library-registration-form.page.scss'],
})
export class LibraryRegistrationFormPage {
  private router = inject(Router);
  private lrfService = inject(LibraryRegistrationFormService);

  pageTitle = 'Register your library';
  sections = this.lrfService.steps;
  masterForm = this.lrfService.mainForm;
  currentSectionIndex = this.lrfService.currentSectionIndex;
  maxReachedIndex = this.lrfService.maxReachedIndex;

  currentSectionId = computed(() => this.sections[this.currentSectionIndex()].key);
  progress = computed(() => {
    const controls = Object.values(this.masterForm.controls) as AbstractControl[];
    const completedSections = controls.filter((control) => control.valid).length;
    const totalFormSections = this.sections.length;
    if (totalFormSections <= 0) return 0;
    return completedSections / totalFormSections;
  });
  isAlertOpen = false;
  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {},
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.router.navigate(['/home']);
      },
    },
  ];

  setResult(event: CustomEvent<OverlayEventDetail>) {
    console.log(`Dismissed with role: ${event.detail.role}`);
  }

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      chevronBack,
      chevronForward,
      checkmarkDoneOutline,
      arrowForward,
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

  addSectionForm(name: string, group: unknown) {
    if (group instanceof FormGroup) {
      this.masterForm.addControl(name, group);
    } else {
      console.error('Error: A non-FormGroup value was emitted for section:', name);
    }
  }

  onSegmentChange(event: any) {
    const newIndex = this.sections.findIndex((s) => s.key === event.detail.value);
    this.lrfService.goToStep(newIndex);
  }

  nextSection() {
    this.lrfService.nextStep();
  }

  prevSection() {
    this.lrfService.prevStep();
  }

  onSubmit() {
    if (this.masterForm.valid) {
      console.log('Final Form Data:', this.masterForm.value);
      alert('Registration Submitted!');
      this.router.navigate(['/registration-acknowledgement']);
    } else {
      console.error('Form is invalid', this.masterForm);
      alert('Please complete all required sections.');
    }
  }

  onCancel() {
    if (confirm('Are you sure you want to cancel the registration? All data will be lost.')) {
      this.masterForm.reset();
      this.currentSectionIndex.set(0);
      this.setOpen(true);
    }
  }
  handleCancelConfirm() {
    this.lrfService.reset();
    this.router.navigate(['/home']);
  }

  isCurrentSectionValid(): boolean {
    return this.lrfService.isCurrentStepValid();
  }

  isSectionComplete(sectionId: string): boolean {
    return this.lrfService.getFormGroup(sectionId)?.valid ?? false;
  }

  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
}
