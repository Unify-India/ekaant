import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline, eyeOutline } from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-request-detail',
  templateUrl: './library-request-detail.page.html',
  styleUrls: ['./library-request-detail.page.scss'],
  standalone: true,
  imports: [IonBackButton, BaseUiComponents, UiEssentials, FormEssentials],
})
export class LibraryRequestDetailPage implements OnInit {
  requestForm: FormGroup;
  requestId: string | null = null;
  isViewOnly: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
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

    // In a real app, you would fetch the request data from a service using the requestId
    this.loadMockData(this.requestId);

    if (this.isViewOnly) {
      this.requestForm.disable();
    }
  }

  loadMockData(id: string | null) {
    // This is mock data. Replace with actual data fetching logic.
    const mockData: { [key: string]: any } = {
      'req-001': {
        libraryManager: 'Rohan Mehta',
        libraryName: "The Scholar's Nook",
        address: '123 University Ave, Pune, Maharashtra',
        totalSeats: 100,
        contactEmail: 'rohan.mehta@example.com',
        contactPhone: '+919988776655',
        applicationStatus: 'pending',
        adminComments: 'Awaiting verification of ownership documents.',
        createdAt: '2025-09-15T10:30:00Z',
        updatedAt: '2025-09-15T10:30:00Z',
      },
      'req-002': {
        libraryManager: 'Anjali Sharma',
        libraryName: 'Readers Paradise',
        address: '456 Library Rd, Mumbai, Maharashtra',
        totalSeats: 75,
        contactEmail: 'anjali.sharma@example.com',
        contactPhone: '+919876543210',
        applicationStatus: 'approved',
        adminComments: 'All documents verified. Approved.',
        createdAt: '2025-09-14T11:00:00Z',
        updatedAt: '2025-09-15T12:45:00Z',
      },
      'req-003': {
        libraryManager: 'Vikram Singh',
        libraryName: 'Knowledge Hub',
        address: '789 Bookworm Ln, Delhi',
        totalSeats: 120,
        contactEmail: 'vikram.singh@example.com',
        contactPhone: '+919123456789',
        applicationStatus: 'revision_requested',
        adminComments: 'Ownership document is not clear. Please re-upload.',
        createdAt: '2025-09-13T09:00:00Z',
        updatedAt: '2025-09-14T15:20:00Z',
      },
    };

    if (id && mockData[id]) {
      this.requestForm.patchValue(mockData[id]);
    } else {
      console.log('No data for this ID, starting with a new form.');
    }
  }

  cancel() {
    this.router.navigate(['/admin/pending-requests']);
  }

  update() {
    if (this.requestForm.valid) {
      console.log('Updating request:', this.requestId, this.requestForm.value);
      // Here you would call a service to update the data
      this.router.navigate(['/admin/pending-requests']);
    } else {
      console.log('Form is invalid');
      // Optionally, mark all fields as touched to show validation errors
      this.requestForm.markAllAsTouched();
    }
  }
}
