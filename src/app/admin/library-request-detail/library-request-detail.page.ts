import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline, eyeOutline } from 'ionicons/icons';
import { LibraryService } from 'src/app/services/library/library.service';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-request-detail',
  templateUrl: './library-request-detail.page.html',
  styleUrls: ['./library-request-detail.page.scss'],
  standalone: true,
  imports: [IonBackButton, BaseUiComponents, UiEssentials, FormEssentials, CommonModule],
})
export class LibraryRequestDetailPage implements OnInit {
  requestForm: FormGroup;
  requestId: string | null = null;
  isViewOnly: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private libraryService: LibraryService,
  ) {
    addIcons({ saveOutline, closeOutline, eyeOutline });

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

    if (this.requestId) {
      this.libraryService.getLibraryRegistrationById(this.requestId).subscribe((data) => {
        if (data) {
          console.info('data', data);
          // Convert Firestore Timestamps to readable dates
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate().toLocaleString();
          }
          if (data.updatedAt && data.updatedAt.toDate) {
            data.updatedAt = data.updatedAt.toDate().toLocaleString();
          }
          this.requestForm.patchValue(data);
        }
      });
    }

    if (this.isViewOnly) {
      this.requestForm.disable();
    }
  }

  cancel() {
    this.router.navigate(['/admin/pending-requests']);
  }

  update() {
    if (this.requestForm.valid && this.requestId) {
      this.libraryService.updateLibrary(this.requestId, this.requestForm.value).then(() => {
        this.router.navigate(['/admin/pending-requests']);
      });
    } else {
      console.log('Form is invalid');
      // Optionally, mark all fields as touched to show validation errors
      this.requestForm.markAllAsTouched();
    }
  }
}
