import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  buildOutline,
  downloadOutline,
  headsetOutline,
  heartOutline,
  peopleOutline,
  ribbonOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.page.html',
  styleUrls: ['./campaign.page.scss'],
  standalone: true,
  imports: [IonToggle, BaseUiComponents, UiEssentials, IonToggle, FormsModule],
})
export class CampaignPage implements OnInit {
  campaigns = [
    {
      name: 'Sponsored Listing',
      description: 'Appear at the top of search results',
      price: 29,
      benefit: '+40% visibility boost',
      active: false,
      colorClass: 'campaign-blue',
    },
    {
      name: 'Top Listed',
      description: 'Premium placement in library listings',
      price: 19,
      benefit: 'Premium badge included',
      active: false,
      colorClass: 'campaign-green',
    },
    {
      name: 'Featured Library',
      description: 'Homepage spotlight & social promotion',
      price: 49,
      benefit: 'Maximum exposure package',
      active: false,
      colorClass: 'campaign-orange',
    },
  ];

  constructor() {
    addIcons({
      heartOutline,
      downloadOutline,
      trendingUpOutline,
      peopleOutline,
      ribbonOutline,
      buildOutline,
      analyticsOutline,
      headsetOutline,
    });
  }

  ngOnInit() {}

  toggleCampaign(campaign: any) {
    campaign.active = !campaign.active;
  }
}
