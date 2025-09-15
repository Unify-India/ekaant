import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonToolbar, IonFooter } from '@ionic/angular/standalone';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.page.html',
  styleUrls: ['./footer.page.scss'],
  standalone: true,
  imports: [IonFooter, IonToolbar, CommonModule, FormsModule],
})
export class FooterPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
