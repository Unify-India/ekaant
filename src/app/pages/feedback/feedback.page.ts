import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonIcon, IonCardContent, IonGrid, IonRow, IonCol, IonCard } from '@ionic/angular/standalone';
import { Testimonial } from 'src/app/models/feedback-support';
import { star } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [IonCard, IonCol, IonRow, IonGrid, IonCardContent, IonIcon, CommonModule, FormsModule],
})
export class FeedbackPage {
  constructor() {
    addIcons({ star });
  }
  testimonials: Testimonial[] = [
    {
      name: 'A. K. Sharma',
      role: 'Library Owner, Delhi',
      avatar: 'assets/avatars/avatar1.png',
      feedback:
        "Switching to Ekaant was a game-changer. Our records are clean, revenue is up, and students are happier. It's incredibly simple and affordable, even for our library in a smaller city.",
      stars: 5,
    },
    {
      name: 'Priya Singh',
      role: 'Intermediate Student',
      avatar: 'assets/avatars/avatar2.png',
      feedback:
        "As a student, finding a quiet study spot used to be a hassle. Now I can see what's free and book it from my phone in seconds. The support ticket feature is a lifesaver!",
      stars: 5,
    },
  ];
}
