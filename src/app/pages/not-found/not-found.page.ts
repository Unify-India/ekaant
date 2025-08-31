import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class NotFoundPage implements OnInit {
  counter = 5;
  private intervalId: any;
  private routerSub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    // Subscribe to navigation events to reset countdown if we land here again
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Only reset if we are still on the not-found page
        if (this.router.url && this.router.url !== '/home') {
          this.startCountdown();
        }
      }
    });

    this.startCountdown();
  }

  private startCountdown() {
    // Clear previous timer if any
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.counter = 5;

    this.intervalId = setInterval(() => {
      this.counter--;

      if (this.counter === 0) {
        clearInterval(this.intervalId);
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
