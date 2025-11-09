import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  constructor(private toastController: ToastController) {}

  async showToast(message: string, color: string) {
    try {
      const toast = await this.toastController.create({
        message: message,
        duration: 3000,
        color: color,
      });
      await toast.present();
    } catch (err) {
      // NOTE: In some dev/test contexts (or early app bootstrap), the Ionic
      // overlay container may not be available, causing an 'overlay does not exist'
      // error. This can happen during creation or presentation of the toast.
      // We fall back to a simple console warning and a native alert to prevent
      // the application flow from breaking.
      console.warn(`Toast failed to present for message: "${message}"`, err);
      try {
        (window as any)?.alert?.(message);
      } catch (e) {
        // NOTE: window.alert might not be available in all environments (e.g., SSR).
        // This error can be safely ignored.
      }
    }
  }
}
