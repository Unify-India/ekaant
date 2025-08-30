export class MenuData {
  public static defaultAppPages = [
    { title: 'Dashboard', url: 'dashboard', icon: 'grid' },
    { title: 'Nearby Library', url: '/browse-libraries', icon: 'library' },
    { title: 'Plans', url: 'plans', icon: 'list' },
    { title: 'Testimonials', url: '/testimonials', icon: 'star' },
    { title: 'Login', url: 'login', icon: 'log-in' },
  ];

  public static adminAppPages = [
    { title: 'Dashboard', url: 'admin/dashboard', icon: 'home' },
    { title: 'Pending Requests', url: 'admin/pending-requests', icon: 'hourglass' },
    { title: 'School Management', url: 'admin/school-management/school-list', icon: 'school' },
    { title: 'User Management', url: 'admin/user-management/user-list', icon: 'people' },
    { title: 'Performance Report', url: 'admin/reports/performance-report', icon: 'stats-chart' },
    { title: 'Activity Report', url: 'admin/reports/activity-report', icon: 'stats-chart' },
  ];

  public static managerAppPages = [
    { title: 'Dashboard', url: 'manager/dashboard', icon: 'home' },
    { title: 'Bookings', url: 'manager/question-management/create-question', icon: 'create' },
    { title: 'Slot Management', url: 'manager/question-management/question-list', icon: 'list' },
    { title: 'Tickets Board', url: 'manager/exam-management/create-exam', icon: 'create' },
    { title: 'Users', url: 'manager/exam-management/exam-list', icon: 'list' },
    { title: 'Notifications', url: 'manager/marketplace/my-listings', icon: 'list' },
    { title: 'Reports', url: 'manager/marketplace/sales-report', icon: 'stats-chart' },
  ];

  public static studentAppPages = [
    { title: 'Dashboard', url: 'student/dashboard', icon: 'home' },
    { title: 'Exam List', url: 'student/exam-list', icon: 'list' },
    { title: 'Browse Questions', url: 'student/marketplace/browse-questions', icon: 'search' },
    { title: 'My Purchases', url: 'student/marketplace/my-purchases', icon: 'cart' },
    { title: 'School Search', url: 'student/school-search', icon: 'school' },
  ];
}
