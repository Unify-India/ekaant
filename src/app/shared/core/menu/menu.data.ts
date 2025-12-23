export class MenuData {
  public static defaultAppPages = [
    { title: 'Dashboard', url: 'home', icon: 'grid', color: 'primary' },
    { title: 'Nearby Library', url: 'browse-libraries', icon: 'library', color: 'tertiary' },
    { title: 'Pricing', url: 'pricing', icon: 'cash', color: 'success' },
    { title: 'Login', url: 'login', icon: 'log-in', color: 'medium' },
  ];

  public static libraryRegistrationPending = [
    { title: 'My Application', url: 'manager/application-status', icon: 'document-text', color: 'primary' },
    { title: 'Pricing', url: 'pricing', icon: 'cash', color: 'success' },
  ];

  public static adminAppPages = [
    { title: 'Dashboard', url: 'admin/dashboard', icon: 'home' },
    { title: 'Pending Requests', url: 'admin/pending-requests', icon: 'hourglass' },
    { title: 'Library Management', url: 'admin/library-management', icon: 'library' },
    { title: 'User Management', url: 'admin/user-management', icon: 'people' },
    { title: 'Performance Report', url: 'admin/reports/performance-report', icon: 'stats-chart' },
    { title: 'User Feedback', url: 'admin/user-feedback', icon: 'chatbubbles' },
  ];

  public static managerAppPages = [
    { title: 'Dashboard', url: 'manager/dashboard', icon: 'grid', color: 'primary' },
    { title: 'Bookings', url: 'manager/student-applications', icon: 'book', color: 'tertiary' },
    { title: 'Slot Management', url: 'manager/slot-management', icon: 'list', color: 'success' },
    { title: 'Tickets', url: 'manager/tickets', icon: 'construct', color: 'warning' },
    { title: 'Users', url: 'manager/users', icon: 'people', color: 'secondary' },
    { title: 'Payments', url: 'manager/payment-history', icon: 'cash', color: 'success' },
    { title: 'Notifications', url: 'manager/notifications', icon: 'notifications', color: 'primary' },
    { title: 'Reports', url: 'manager/performance-report', icon: 'stats-chart', color: 'tertiary' },
    { title: 'Campaign', url: 'manager/campaign', icon: 'megaphone', color: 'warning' },
    { title: 'Library Profile', url: 'manager/library-profile', icon: 'business', color: 'secondary' },
    { title: 'My Profile', url: 'manager/manager-profile', icon: 'person', color: 'secondary' },
  ];

  public static studentAppPages = [
    { title: 'Dashboard', url: 'student/dashboard', icon: 'grid', color: 'primary' },
    { title: 'Nearby Library', url: 'browse-libraries', icon: 'library', color: 'tertiary' },
    { title: 'Bookings', url: 'student/my-bookings', icon: 'list', color: 'medium' },
    { title: 'Payments', url: 'student/payments', icon: 'cash', color: 'success' },
    { title: 'Tickets', url: 'student/tickets', icon: 'construct', color: 'warning' },
    { title: 'Profile', url: 'student/profile', icon: 'person', color: 'medium' },
  ];
}
