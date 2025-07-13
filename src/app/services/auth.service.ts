
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Static users for MVP: username, password, role
  private staticUsers = [
    { username: 'student', password: 'student123', role: 'student' },
    { username: 'manager', password: 'manager123', role: 'manager' },
    { username: 'admin', password: 'admin123', role: 'admin' }
  ];

  private currentUser: { username: string, role: string } | null = null;

  constructor(private router: Router) { }

  login(username: string, password: string): boolean {
    const user = this.staticUsers.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = { username: user.username, role: user.role };
      localStorage.setItem('ekaant_user', JSON.stringify(this.currentUser));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('ekaant_user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (this.currentUser) return true;
    const user = localStorage.getItem('ekaant_user');
    if (user) {
      this.currentUser = JSON.parse(user);
      return true;
    }
    return false;
  }

  getRole(): string | null {
    if (!this.isLoggedIn()) return null;
    return this.currentUser?.role || null;
  }

  isStudent(): boolean {
    return this.getRole() === 'student';
  }

  isManager(): boolean {
    return this.getRole() === 'manager';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }
}
