import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
import { response } from 'express';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoadingService } from '../../../service/loading/loading';

@Component({
  selector: 'app-role',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './role.html',
  styleUrl: './role.css'
})
export class Role implements OnInit {

  ngOnInit(): void {
    this.loadRole();
  }

  constructor(private roleService: Roleservice, private cdr: ChangeDetectorRef, private router: Router ,private loadingService: LoadingService) { }  

   roles: any[] = [];
  filteredRoles: any[] = []; // NEW
  searchOpen = true; // NEW
  searchTerm = ''; // NEW


  loadRole() {
    this.roleService.getRole().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.filteredRoles = [...this.roles]; // NEW
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading role")
      }
    })
  }

  // NEW SEARCH METHODS
  toggleSearch() {
    
    this.searchOpen = true;
    if (!this.searchOpen) {
      this.searchTerm = '';
      this.filterRoles();
    }
  }

  filterRoles() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRoles = [...this.roles];
      return;
    }
    this.filteredRoles = this.roles.filter(role =>
      role.roleName.toLowerCase().includes(term) ||
      role.description.toLowerCase().includes(term)
    );
  }

  // Edit
  editRoles = {
    roleName: "",
    description: ""
  }

  selectedRoleId: string = '';
  openEditRole = false;

openeditRolePopup(role: any) {
  this.router.navigate(['/editrole', role.id], { 
    state: { role: role }   // ← pass full role object
  });
}

  closeEditRolePopup() {
    this.openEditRole = false;
  }

  updateRole() {
    this.roleService.updateRole(this.editRoles, this.selectedRoleId).subscribe({
      next: (res: any) => {
       this.loadingService.showToast(res.message || 'Role updated successfully', 'success'); 
        this.closeEditRolePopup();
        this.loadRole();
      },
      error: () => {
         this.loadingService.showToast('Error updating role!', 'error'); 
      }
    })
  }

  // Delete role
  openDeleteRole = false;

  openDeleteRolePopup(role: any) {
    this.selectedRoleId = role.id;
    this.openDeleteRole = true;
  }

  closeDeleteRolePopup() {
    this.openDeleteRole = false;
  }

  deleteRole() {
    this.roleService.DeleteRole(this.selectedRoleId).subscribe({
      next: (res: any) => {
       this.loadingService.showToast(res.message || 'Role deleted successfully', 'success'); 
        this.closeDeleteRolePopup();
        this.loadRole();
      },
      error: () => {
             this.loadingService.showToast('Error deleting role!', 'error');
      }
    })
  }
}