import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { AlertController, ToastController } from '@ionic/angular';
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
  private functions = inject(Functions);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

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
  async deleteRequest(libraryId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this library and all its associated data? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.executeDelete(libraryId);
          },
        },
      ],
    });
    await alert.present();
  }

  private async executeDelete(libraryId: string) {
    const deleteFn = httpsCallable(this.functions, 'admin-deleteLibrary');
    try {
      const result = await deleteFn({ libraryId });
      const message = (result.data as any)?.message || 'Library deleted successfully.';
      this.presentToast(message, 'success');
      // Refresh the list
      this.libraries$ = this.libraryService.getApprovedLibraries();
    } catch (error: any) {
      console.error('Error deleting library:', error);
      this.presentToast(error.message, 'danger');
    }
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
  private async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
    });
    toast.present();
  }
}
