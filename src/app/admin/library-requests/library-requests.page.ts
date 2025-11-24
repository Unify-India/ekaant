import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonChip, IonSpinner } from '@ionic/angular/standalone';
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
import { Observable } from 'rxjs';
import { LibraryService } from 'src/app/services/library/library.service';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-requests',
  templateUrl: './library-requests.page.html',
  styleUrls: ['./library-requests.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonChip, BaseUiComponents, UiEssentials, CommonModule],
})
export class LibraryRequestsPage implements OnInit {
  requests$!: Observable<any[]>;

  constructor(
    private router: Router,
    private libraryService: LibraryService,
  ) {
    addIcons({ cloudDownloadOutline, addOutline, eyeOutline, createOutline, trashOutline, saveOutline, closeOutline });
  }

  ngOnInit() {
    this.requests$ = this.libraryService.getPendingLibraries();
    console.info('requests', this.requests$);
  }

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
