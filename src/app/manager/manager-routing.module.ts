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
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'complete-profile',
        loadComponent: () => import('./complete-profile/complete-profile.page').then((m) => m.CompleteProfilePage),
      },
      {
        path: 'student-applications',
        loadComponent: () =>
          import('./student-applications/student-applications.page').then((m) => m.StudentApplicationsPage),
      },
      {
        path: 'performance-report',
        loadComponent: () =>
          import('./performance-report/performance-report.page').then((m) => m.PerformanceReportPage),
      },
      {
        path: 'tickets',
        loadComponent: () => import('./tickets/tickets.page').then((m) => m.TicketsPage),
      },
      {
        path: 'slot-management',
        loadComponent: () => import('./slot-management/slot-management.page').then((m) => m.SlotManagementPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.page').then((m) => m.UsersPage),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./bookings/bookings.page').then((m) => m.BookingsPage),
      },
      {
        path: 'campaign',
        loadComponent: () => import('./campaign/campaign.page').then((m) => m.CampaignPage),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'payment-history',
        loadComponent: () => import('./payment-history/payment-history.page').then((m) => m.PaymentHistoryPage),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutingModule {}
