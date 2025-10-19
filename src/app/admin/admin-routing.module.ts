import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { adminGuard } from '../auth/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
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
        path: 'pending-requests',
        loadComponent: () => import('./library-requests/library-requests.page').then((m) => m.LibraryRequestsPage),
      },
      {
        path: 'library-request-detail',
        loadComponent: () =>
          import('./library-request-detail/library-request-detail.page').then((m) => m.LibraryRequestDetailPage),
      },
      {
        path: 'user-feedback',
        loadComponent: () => import('./user-feedback/user-feedback.page').then((m) => m.UserFeedbackPage),
      },
      {
        path: 'library-management',
        loadComponent: () =>
          import('./library-management/library-management.page').then((m) => m.LibraryManagementPage),
      },
      {
        path: 'user-management',
        loadComponent: () => import('./user-management/user-management.page').then((m) => m.UserManagementPage),
      },
      {
        path: 'reports/performance-report',
        loadComponent: () =>
          import('./reports/performance-report/performance-report.page').then((m) => m.PerformanceReportPage),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
