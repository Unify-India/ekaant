import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCard, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class PrivacyPolicyPage implements OnInit {
  pageTitle = 'Privacy Policy';
  lastUpdated = 'August 31, 2025';

  policyContent: string = `
Welcome to Ekaant ('we,' 'our,' or 'us'). We are committed to protecting your privacy. 
This Privacy Policy explains how we collect, use, and safeguard your information when 
you use our mobile application and related services (collectively, the 'Service').

By using our Service, you agree to the collection and use of information in accordance with this policy.

1. Information We Collect
Account Information: When you create an account, we collect your name and email address. 
This information is used solely for account identification, authentication, and communication related to your bookings.

Non-Identifiable Usage Data: We automatically collect anonymized data related to your use of the Service, 
including your booking history, the duration and frequency of your study sessions, and the libraries you interact with. 
This data is aggregated and does not personally identify you.

2. How We Use Your Information
To Provide and Manage the Service: To manage your account, process your cubicle reservations, 
and send you important notifications about your bookings.

To Improve Our Service: To understand usage patterns and improve the functionality and 
user experience of the Ekaant app.

For Analytics with Library Owners: We share aggregated and strictly non-identifiable usage data with our 
partner library owners. This helps them understand space utilization and improve their services. 
For example, we might share a report stating, 'Cubicle 5 was booked for 40 hours this month,' 
but we will never share who booked it.

3. Data Sharing and Disclosure
We value your privacy and do not sell, trade, or rent your personal information to third parties 
for marketing purposes. Your data is shared only in the following limited circumstances:

Service Providers: We use trusted third-party services like Google Firebase for essential functions 
such as user authentication, database management, and hosting. These providers are bound by their own 
privacy policies and do not have permission to use your data for any other purpose.

Legal Requirements: We may disclose your information if required to do so by law or in response to valid 
requests by public authorities.

4. Data Security
We implement industry-standard security measures to protect your information. All data is transmitted 
over secure connections (SSL/TLS) and stored in a secure cloud environment to prevent unauthorized access, use, or disclosure.

5. Data Retention and Deletion
We retain your personal information for as long as your account remains active. You have the right to delete 
your account at any time. Upon receiving a deletion request, we will permanently remove all your personal 
data from our active systems.

For more information or to initiate the process, please visit our Account Deletion Page.

6. Children's Privacy
Our Service is not intended for use by anyone under the age of 13. We do not knowingly collect personally 
identifiable information from children under 13.

7. Changes to This Privacy Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
new policy on this page and updating the 'Last Updated' date.

8. Contact Us
If you have any questions about this Privacy Policy, please contact us at: privacy@ekaant.app
`;
  constructor() {}

  ngOnInit() {}
}
