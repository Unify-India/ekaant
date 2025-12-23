import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'application-form/:id',
        loadComponent: () => import('./application-form/application-form.page').then((m) => m.ApplicationFormPage),
      },
      {
        path: 'browse-libraries',
        loadComponent: () =>
          import('../pages/browse-libraries/browse-libraries.page').then((m) => m.BrowseLibrariesPage),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'my-bookings',
        loadComponent: () => import('./my-bookings/my-bookings.page').then((m) => m.MyBookingsPage),
      },
      {
        path: 'my-library',
        loadComponent: () => import('./my-library/my-library.page').then((m) => m.MyLibraryPage),
      },
      {
        path: 'payments',
        loadComponent: () => import('./payments/payments.page').then((m) => m.PaymentsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'tickets',
        loadComponent: () => import('./tickets/tickets.page').then((m) => m.TicketsPage),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentRoutingModule {}
