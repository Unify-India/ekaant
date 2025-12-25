import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonProgressBar,
  AlertController,
} from '@ionic/angular/standalone';
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
  closeOutline,
} from 'ionicons/icons';
import { DraftService } from 'src/app/services/draft.service';
import { ToasterService } from 'src/app/services/toaster/toaster.service';
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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonProgressBar,
  ],
  templateUrl: './library-registration-form.page.html',
  styleUrls: ['./library-registration-form.page.scss'],
})
export class LibraryRegistrationFormPage implements OnInit {
  private router = inject(Router);
  lrfService = inject(LibraryRegistrationFormService);
  private draftService = inject(DraftService);
  private toaster = inject(ToasterService);
  private alertController = inject(AlertController);

  pageTitle = 'Register your library';
  sections = this.lrfService.steps;

  ngOnInit() {
    // console.log('Library Registration Form initialized');
  }
  masterForm = this.lrfService.mainForm;
  currentSectionIndex = this.lrfService.currentSectionIndex;
  maxReachedIndex = this.lrfService.maxReachedIndex;

  currentSectionId = computed(() => this.sections[this.currentSectionIndex()].key);
  progress = computed(() => {
    const totalFormSections = this.sections.length;
    if (totalFormSections <= 0) return 0;
    return this.currentSectionIndex() / totalFormSections;
  });

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
      closeOutline,
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

  async onFinalSubmit() {
    if (!this.masterForm.valid) {
      console.error('Form is invalid', this.masterForm);
      alert('Please complete all required sections before submitting.');
      return;
    }

    try {
      if (this.lrfService.editMode) {
        await this.lrfService.updateLibrary();
        this.toaster.showToast('Application updated successfully!', 'success');
        this.router.navigate(['/manager/application-status']);
      } else {
        await this.lrfService.submitLibrary();
        await this.draftService.clearDraft();
        this.router.navigate(['/registration-acknowledgement']);
      }
    } catch (err: any) {
      this.toaster.showToast(err.message, 'danger');
    }
  }

  async onCancel() {
    if (this.lrfService.editMode) {
      this.router.navigate(['/manager/application-status']);
    } else {
      const alert = await this.alertController.create({
        header: 'Exit Registration?',
        message: 'You can save your progress as a draft and resume later, or discard it completely.',
        buttons: [
          {
            text: 'Stay',
            role: 'cancel',
          },
          {
            text: 'Discard',
            role: 'destructive',
            handler: () => {
              this.lrfService.reset();
              this.router.navigate(['/home']);
            },
          },
          {
            text: 'Save & Exit',
            handler: async () => {
              await this.draftService.saveDraft(this.lrfService.mainForm.getRawValue());
              this.router.navigate(['/home']);
            },
          },
        ],
      });
      await alert.present();
    }
  }

  isCurrentSectionValid(): boolean {
    return this.lrfService.isCurrentStepValid();
  }

  isSectionComplete(sectionId: string): boolean {
    return this.lrfService.getFormGroup(sectionId)?.valid ?? false;
  }
}
