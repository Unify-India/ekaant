import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  saveOutline,
  closeOutline,
  cloudDownloadOutline,
  eyeOutline,
} from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-requests',
  templateUrl: './library-requests.page.html',
  styleUrls: ['./library-requests.page.scss'],
  standalone: true,
  imports: [IonChip, BaseUiComponents, UiEssentials],
})
export class LibraryRequestsPage implements OnInit {
  // Mock data for the table
  requests = [
    {
      libraryManager: 'Rohan Mehta',
      libraryName: "The Scholar's Nook",
      address: '123 University Ave, Pune, Maharashtra',
      totalSeats: 100,
      applicationStatus: 'pending',
      id: 'req-001',
    },
    {
      libraryManager: 'Anjali Sharma',
      libraryName: 'Readers Paradise',
      address: '456 Library Rd, Mumbai, Maharashtra',
      totalSeats: 75,
      applicationStatus: 'approved',
      id: 'req-002',
    },
    {
      libraryManager: 'Vikram Singh',
      libraryName: 'Knowledge Hub',
      address: '789 Bookworm Ln, Delhi',
      totalSeats: 120,
      applicationStatus: 'revision_requested',
      id: 'req-003',
    },
  ];

  constructor(private router: Router) {
    addIcons({ cloudDownloadOutline, addOutline, eyeOutline, createOutline, trashOutline, saveOutline, closeOutline });
  }

  ngOnInit() {}

  // Navigates to the detail page in edit mode
  editRequest(requestId: string) {
    this.router.navigate(['/admin/library-request-detail', requestId]);
  }

  // Navigates to the detail page in view-only mode
  viewRequest(requestId: string) {
    this.router.navigate(['/admin/library-request-detail', requestId], { queryParams: { mode: 'view' } });
  }

  // Placeholder for delete action
  deleteRequest(requestId: string) {
    console.log('Deleting request:', requestId);
    // Here you would typically call a service to delete the item
  }

  // Placeholder for export action
  exportCsv() {
    console.log('Exporting to CSV...');
    // Logic to convert `this.requests` to CSV and download
  }

  // Placeholder for adding a new item
  addNewRequest() {
    console.log('Navigating to add new request form...');
    // Example: this.router.navigate(['/admin/new-library-request']);
  }
}
