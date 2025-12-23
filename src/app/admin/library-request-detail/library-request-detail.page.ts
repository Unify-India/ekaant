import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonBackButton, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline, eyeOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
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
  isApproving = false;

  private functions = inject(Functions);
  private toastController = inject(ToastController);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private libraryService: LibraryService,
    private authService: AuthService,
  ) {
    addIcons({ saveOutline, closeOutline, eyeOutline, checkmarkCircleOutline, closeCircleOutline });

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
          const mappedData = this._mapDataToForm(data);
          if (mappedData.createdAt && mappedData.createdAt.toDate) {
            mappedData.createdAt = mappedData.createdAt.toDate().toLocaleString();
          }
          if (mappedData.updatedAt && mappedData.updatedAt.toDate) {
            mappedData.updatedAt = mappedData.updatedAt.toDate().toLocaleString();
          }
          this.requestForm.patchValue(mappedData);
        }
      });
    }

    if (this.isViewOnly) {
      this.requestForm.disable();
    }
  }

  private _mapDataToForm(data: any): any {
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

  async approve() {
    if (!this.requestId) return;
    this.isApproving = true;

    const approveFn = httpsCallable(this.functions, 'registration-approveLibrary');
    try {
      const result: any = await approveFn({ registrationId: this.requestId });
      await this.presentToast(result.message, 'success');
      this.router.navigate(['/admin/pending-requests']);
    } catch (error: any) {
      console.error('Error approving library:', error);
      await this.presentToast(error.message, 'danger');
    } finally {
      this.isApproving = false;
    }
  }

  async reject() {
    if (this.requestForm.valid && this.requestId) {
      const formValue = {
        ...this.requestForm.value,
        applicationStatus: 'rejected',
      };
      await this.libraryService.updateLibraryRegistration(this.requestId, formValue);
      await this.presentToast('Application has been rejected.', 'warning');
      this.router.navigate(['/admin/pending-requests']);
    }
  }

  async saveChanges() {
    if (this.requestForm.valid && this.requestId) {
      const formValue = this.requestForm.value;
      await this.libraryService.updateLibraryRegistration(this.requestId, formValue);
      await this.presentToast('Changes have been saved.', 'success');
    } else {
      console.log('Form is invalid');
      this.requestForm.markAllAsTouched();
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: color,
    });
    toast.present();
  }
}
