import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import {
  IonBackButton,
  IonSpinner,
  IonBadge,
  IonFooter,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  closeOutline,
  eyeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  refreshOutline,
  documentTextOutline,
  checkmarkCircle,
  closeCircle,
} from 'ionicons/icons';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ApprovalCommentsComponent } from 'src/app/components/approval-comments/approval-comments.component';
import { LibraryService } from 'src/app/services/library/library.service';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-request-detail',
  templateUrl: './library-request-detail.page.html',
  styleUrls: ['./library-request-detail.page.scss'],
  standalone: true,
  imports: [
    IonAccordion,
    IonAccordionGroup,
    IonFooter,
    IonBadge,
    CommonModule,
    IonSpinner,
    IonBackButton,
    BaseUiComponents,
    UiEssentials,
    FormEssentials,
    ApprovalCommentsComponent,
  ],
})
export class LibraryRequestDetailPage implements OnInit {
  requestForm: FormGroup;
  requestId: string | null = null;
  isViewOnly: boolean = false;
  currentUserRole: 'admin' | 'manager' = 'admin';
  currentUserId!: string;
  isProcessing = false;
  persistedStatus: string = 'pending';
  fullLibraryData: any = null;

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

  private functions = inject(Functions);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private libraryService: LibraryService,
    private authService: AuthService,
  ) {
    addIcons({
      checkmarkCircle,
      closeCircle,
      documentTextOutline,
      saveOutline,
      closeCircleOutline,
      refreshOutline,
      checkmarkCircleOutline,
      closeOutline,
      eyeOutline,
    });

    this.requestForm = this.fb.group({
      libraryManager: ['', Validators.required],
      libraryName: ['', Validators.required],
      address: ['', Validators.required],
      totalSeats: [0, [Validators.required, Validators.min(1)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required],
      applicationStatus: ['pending', Validators.required],
      adminComments: [''],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }],
    });
  }

  get currentStatus(): string {
    return this.requestForm.get('applicationStatus')?.value;
  }

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id');
    this.isViewOnly = this.route.snapshot.queryParamMap.get('mode') === 'view';

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.uid;
      this.currentUserRole = this.authService.getCurrentUser()?.role as 'admin' | 'manager';
    }

    if (this.requestId) {
      this.libraryService.getLibraryRegistrationById(this.requestId).subscribe((data) => {
        if (data) {
          this.fullLibraryData = data;
          const mappedData = this._mapDataToForm(data);
          this.persistedStatus = mappedData.applicationStatus || 'pending';

          if (mappedData.createdAt && mappedData.createdAt.toDate) {
            mappedData.createdAt = mappedData.createdAt.toDate().toLocaleString();
          }
          if (mappedData.updatedAt && mappedData.updatedAt.toDate) {
            mappedData.updatedAt = mappedData.updatedAt.toDate().toLocaleString();
          }
          this.requestForm.patchValue(mappedData);

          // Only auto-disable if not admin. Admins should be able to edit/save.
          if (
            ['approved', 'rejected'].includes(mappedData.applicationStatus) &&
            this.currentUserRole !== 'admin' &&
            !this.route.snapshot.queryParamMap.has('mode')
          ) {
            this.isViewOnly = true;
            this.requestForm.disable();
          }
        }
      });
    }

    if (this.isViewOnly) {
      this.requestForm.disable();
    }
  }

  // TODO: Add proper library interface here
  private _mapDataToForm(data: any): any {
    console.info('data', data);
    const addressParts = [
      data.basicInformation?.addressLine1,
      data.basicInformation?.addressLine2,
      data.basicInformation?.city,
      data.basicInformation?.state,
      data.basicInformation?.zipCode,
    ].filter(Boolean);

    return {
      libraryManager: data.hostProfile?.fullName || '',
      libraryName: data.basicInformation?.libraryName || '',
      address: addressParts.join(', ') || '',
      totalSeats: data.seatManagement?.totalSeats || 0,
      contactEmail: data.hostProfile?.email || '',
      contactPhone: data.hostProfile?.phoneNumber || '',
      applicationStatus: data.applicationStatus || 'pending',
      adminComments: data.adminComments || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  cancel() {
    this.router.navigate(['/admin/pending-requests']);
  }

  async saveChanges() {
    if (this.requestForm.dirty && this.requestId) {
      if (this.requestForm.valid) {
        await this._promptForComment('Confirm Changes', 'Please provide a reason for this update:', async (comment) => {
          await this.libraryService.updateLibraryRegistration(this.requestId!, this.requestForm.value);
          this.persistedStatus = this.requestForm.get('applicationStatus')?.value;
          await this._addSystemComment(comment, 'Update');
          await this.presentToast('Changes saved successfully.', 'success');
          this.requestForm.markAsPristine();
        });
      } else {
        this.requestForm.markAllAsTouched();
        await this.presentToast('Please check the form for errors.', 'warning');
      }
    } else {
      await this.presentToast('No changes detected.', 'medium');
    }
  }

  async approve() {
    if (!this.requestId) return;
    await this._promptForComment('Confirm Approval', 'Add an approval note (mandatory):', async (comment) => {
      this.isProcessing = true;
      const approveFn = httpsCallable(this.functions, 'registration-approveLibrary');
      try {
        await this._addSystemComment(comment, 'Approved');
        const result: any = await approveFn({ registrationId: this.requestId });
        await this.presentToast(result.message, 'success');
        this.router.navigate(['/admin/pending-requests']);
      } catch (error: any) {
        console.error('Error approving library:', error);
        await this.presentToast(error.message, 'danger');
      } finally {
        this.isProcessing = false;
      }
    });
  }

  async reject() {
    if (!this.requestId) return;
    await this._promptForComment('Confirm Rejection', 'Reason for rejection (mandatory):', async (comment) => {
      this.isProcessing = true;
      const rejectFn = httpsCallable(this.functions, 'registration-rejectLibrary');
      try {
        await this._addSystemComment(comment, 'Rejected');
        // Cloud function expects 'adminComments' but we also track it in subcollection above
        const result: any = await rejectFn({
          registrationRequestId: this.requestId,
          adminComments: comment,
        });
        await this.presentToast(result.message, 'warning');
        this.router.navigate(['/admin/pending-requests']);
      } catch (error: any) {
        console.error('Error rejecting library:', error);
        await this.presentToast(error.message, 'danger');
      } finally {
        this.isProcessing = false;
      }
    });
  }

  async requestRevision() {
    if (!this.requestId) return;
    await this._promptForComment('Request Revision', 'Reason for revision request (mandatory):', async (comment) => {
      this.isProcessing = true;
      try {
        await this.libraryService.updateLibraryRegistration(this.requestId!, {
          applicationStatus: 'revision_requested',
        });
        this.persistedStatus = 'revision_requested';
        await this._addSystemComment(comment, 'Revision Requested');
        await this.presentToast('Revision requested successfully.', 'warning');
        // Stay on page or navigate? Staying allows verifying status change.
        // Manually update form value to reflect status change immediately
        this.requestForm.patchValue({ applicationStatus: 'revision_requested' });
        this.requestForm.markAsPristine();
      } catch (error: any) {
        console.error('Error requesting revision:', error);
        await this.presentToast('Failed to request revision.', 'danger');
      } finally {
        this.isProcessing = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'changes-required':
        return 'status-changes-required';
      default:
        return '';
    }
  }

  getNormalizedAmenities(): string[] {
    if (!this.fullLibraryData || !this.fullLibraryData.amenities) return [];
    const am = this.fullLibraryData.amenities;
    if (Array.isArray(am)) return am;
    return Object.keys(am).filter((k) => am[k] === true);
  }

  private async _promptForComment(header: string, placeholder: string, action: (comment: string) => Promise<void>) {
    const alert = await this.alertController.create({
      header,
      inputs: [
        {
          name: 'comment',
          type: 'textarea',
          placeholder,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          role: 'destructive',
          handler: async (data) => {
            if (!data.comment || data.comment.trim().length < 5) {
              await this.presentToast('Please provide a valid comment (min 5 chars).', 'warning');
              return false;
            }
            await action(data.comment);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async _addSystemComment(text: string, actionType: string) {
    if (!this.requestId) return;
    await this.libraryService.addComment(this.requestId, {
      text: `[${actionType}] ${text}`,
      authorId: this.currentUserId,
      authorName: 'Admin', // In real app, fetch from profile
      role: 'admin',
    });
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: color,
    });
    toast.present();
  }
}
