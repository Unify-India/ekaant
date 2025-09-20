import { Component, Input } from '@angular/core';
import { IonItem, IonChip, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';
import { Review } from 'src/app/models/library';

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
  imports: [IonChip, IonIcon],
})
export class ReviewCardComponent {
  @Input() reviews: Review[] = [];

  public readonly starArray = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ star, starOutline });
  }

  getTagTypeColor(tag: string): string {
    let classes = '';
    switch (tag) {
      case 'positive':
        classes = 'success';
        break;
      case 'negative':
        classes = 'danger';
        break;
      case 'neutral':
        classes = 'medium';
        break;

      default:
        classes = 'medium';
        break;
    }
    return classes;
  }
}
