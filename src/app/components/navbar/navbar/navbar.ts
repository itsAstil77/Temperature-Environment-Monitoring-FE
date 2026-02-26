import { CommonModule } from '@angular/common';
import { Component,ElementRef,HostListener } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

import { Permission } from '../../service/permission/permission';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule,RouterOutlet],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
   userid: string = '';




   // Permission flags
  canViewTracking = false;
  canViewEvents = false;
  canViewReports = false;
  canViewProcessAutomation = false;
  canViewAdministration = false;
  canViewDashboard = false;


  

  ngOnInit() {
    this.userid = localStorage.getItem('userid') || '';



// Load permissions fresh from localStorage
    this.permission.loadPermissions();
    this.applyPermissions();

      if (this.isTrackingActive()) {
    this.isTrackingMenuOpen = true;
  }


  if (this.isAdminActive()) {
    this.isAdminMenuOpen = false;
  }



  

  }


   applyPermissions() {
    this.canViewDashboard = this.permission.hasPermission('Dashboard');
    this.canViewTracking = this.permission.hasPermission('Tracking');
    this.canViewEvents = this.permission.hasPermission('Events');
    this.canViewReports = this.permission.hasPermission('Reports');
    this.canViewProcessAutomation = this.permission.hasPermission('Process & Automation');
    this.canViewAdministration = this.permission.hasPermission('Administration');
  }






constructor(private router: Router, private eRef: ElementRef,   private permission: Permission) {}



  menuOpen = false;
// isTrackingActive(): boolean {
//   return this.router.url.includes('/live') || this.router.url.includes('/historicals');
// }
isTrackingActive(): boolean {
    const url = this.router.url;
    console.log('Current URL:', url); // Debug logy
    return url.includes('/live') || url.includes('/historicals');
  }
// isAdminActive(): boolean {
//   return this.router.url.includes('/people') || 
//          this.router.url.includes('/licensemanagement') || 
//          this.router.url.includes('/user-management');
// }


// isAdminActive(): boolean {
//   const adminRoutes = ['/project', '/user-management', '/device'];
//   return adminRoutes.some(route => this.router.url.includes(route));
// }


// All routes that belong to Administration menu
isAdminActive(): boolean {
  const adminRoutes = ['/project', '/devices', '/user-management', '/role', '/licensemanagement', '/createrole', '/editrole'];
  return adminRoutes.some(route => this.router.url.startsWith(route));
}



// If you have other menus, same pattern
isReportsActive(): boolean {
  const reportRoutes = ['/reports', '/createreport', '/viewreport', '/historicals'];
  return reportRoutes.some(route => this.router.url.startsWith(route));
}



isProcessAutomationActive(): boolean {
  const routes = ['/processautomation', '/createprocessautomation', '/editprocessautomation'];
  return routes.some(route => this.router.url.startsWith(route));
}



  isAdminMenuOpen = false;

  toggleAdminMenu() {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;

    if (this.isAdminMenuOpen) {
    this.isTrackingMenuOpen = false; // close tracking if admin opens
  }


  }
  isSidebarCollapsed = true;

  toggleSidebar() {
    console.log("click")
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
   
  }

closeAdminMenu() {
  this.isAdminMenuOpen = false;
}


isTrackingMenuOpen = false;
isLiveOpen = false;
isHistoricalsOpen = false;

toggleTrackingMenu() {
  this.isTrackingMenuOpen = !this.isTrackingMenuOpen;
  if (!this.isTrackingMenuOpen) {
    this.isLiveOpen = false;
    this.isHistoricalsOpen = false;
  }
  if (this.isTrackingMenuOpen) {
    this.isAdminMenuOpen = false; // close admin if tracking opens
  }
}

// Close submenu when clicking a nested link
toggleLiveMenu() {
  this.isLiveOpen = !this.isLiveOpen;
  this.isHistoricalsOpen = false; // optional: close the other nested menu
  this.isTrackingMenuOpen = false; // close parent submenu
}

toggleHistoricalsMenu() {
  this.isHistoricalsOpen = !this.isHistoricalsOpen;
  this.isLiveOpen = false; // optional: close the other nested menu
  this.isTrackingMenuOpen = false; // close parent submenu
}

closeTrackingMenu() {
  this.isTrackingMenuOpen = false;
  this.isLiveOpen = false;
  this.isHistoricalsOpen = false;
}






 // ✅ Close when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;


    // ✅ Ignore clicks on menu icon
  if (target.closest('.menu-icon')) {
    return;
  }

    // If click is outside sidebar or submenu
    if (!target.closest('.menu-item')) {
      this.closeTrackingMenu();
       this.closeAdminMenu();
    }
  }


















toggleDropdown(event: Event) {
  event.stopPropagation(); 
  this.menuOpen = !this.menuOpen;
}

@HostListener('document:click')
clickOutside() {
  this.menuOpen = false;
}

goToProfile() {
  this.router.navigate(['/profile']);
}

changePassword() {
  this.router.navigate(['/change-password']);
}

openHelp() {
  this.router.navigate(['/help']);
}

logout() {
  localStorage.clear();
  this.router.navigate(['/login']);
}
























closeAllSubmenus() {
  this.isTrackingMenuOpen = false;
  this.isAdminMenuOpen = false;
  this.isLiveOpen = false;
  this.isHistoricalsOpen = false;
}



}





