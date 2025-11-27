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
  selector: 'app-library-management',
  templateUrl: './library-management.page.html',
  styleUrls: ['./library-management.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonChip, BaseUiComponents, UiEssentials, CommonModule],
})
export class LibraryManagementPage implements OnInit {
  libraries$!: Observable<any[]>;

  constructor(
    private router: Router,
    private libraryService: LibraryService,
  ) {
    addIcons({ cloudDownloadOutline, addOutline, eyeOutline, createOutline, trashOutline, saveOutline, closeOutline });
  }

  ngOnInit() {
    this.libraries$ = this.libraryService.getApprovedLibraries();
  }

  // Navigates to the detail page in edit mode
  editRequest(libraryId: string) {
    this.router.navigate(['/admin/library-request-detail', libraryId]);
  }

  // Navigates to the detail page in view-only mode
  viewRequest(libraryId: string) {
    this.router.navigate(['/admin/library-request-detail', libraryId], { queryParams: { mode: 'view' } });
  }

  // Placeholder for delete action
  deleteRequest(libraryId: string) {
    console.log('Deleting library:', libraryId);
    // Here you would typically call a service to delete the item from 'libraries' collection
  }

  // Placeholder for export action
  exportCsv() {
    console.log('Exporting to CSV...');
  }

  // Placeholder for adding a new item
  addNewRequest() {
    console.log('Navigating to add new library form...');
    // Example: this.router.navigate(['/admin/new-library']);
  }
}