// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-user-management',
//   imports: [],
//   templateUrl: './user-management.html',
//   styleUrl: './user-management.css'
// })
// export class UserManagement {

// }




import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../../service/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { forkJoin } from 'rxjs';
import { LoadingService } from '../../../service/loading/loading';


@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {

  constructor(private user: User,private cdr:ChangeDetectorRef,private roleService: Roleservice,   private loadingService: LoadingService) { }




ngOnInit(): void {
      this.loadRolesAndUsers();
    this.loadUser();

  }

  users: any[] = [];
  filteredUsers: any[] = []; // NEW
  searchOpen = true; // NEW
  searchTerm = ''; // NEW

  loadRolesAndUsers() {
    forkJoin({
      roles: this.roleService.getRole(),
      users: this.user.getUser()
    }).subscribe({
      next: ({ roles, users }: any) => {
        const roleList = roles.data || roles;
        const userList = users.data || users;

        this.roles = roleList;
      this.users = userList.map((user: any) => {
  const matchedRole = roleList.find((r: any) => r.id === user.role);

  return {
    ...user,
    roleName: matchedRole?.roleName || user.role,
    roleId: matchedRole?.roleId || user.role
  };
});

        this.filteredUsers = [...this.users]; // NEW
        this.cdr.detectChanges();
      },
      error: () => {
        console.error('Error loading roles or users');
      }
    });
  }

loadUser() {
  this.user.getUser().subscribe({
    next: (res: any) => {
      const userList = res.data || res;
      this.users = userList.map((user: any) => {
        const matchedRole = this.roles.find((r: any) => r.id === user.role || r.roleName === user.role);
        return {
          ...user,
          roleName: matchedRole?.roleName || user.role,
          roleId: matchedRole?.roleId || matchedRole?.id || ''  // ← use actual roleId
        };
      });
      this.filteredUsers = [...this.users];
      this.cdr.detectChanges();
    },
    error: () => {
      console.log("Error loading user");
    }
  });
}

  // NEW SEARCH METHODS
  toggleSearch() {
      this.searchOpen = true; 
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) {
      this.searchTerm = '';
      this.filterUsers();
    }
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = [...this.users];
      return;
    }
    this.filteredUsers = this.users.filter(user =>
      user.userName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.roleName.toLowerCase().includes(term) ||
      user.contactNumber.includes(term)
    );
  }

NewUser = {
  userName: '',
  contactNumber: '',
  email: '',
  password: '',
  role: '',
  roleId: '',           // ← add this
  createdBy: '',
  createdAt: new Date().toISOString()
};

  openNewUser = false;

openCreateUserPopup() {
  this.loadRole();
  this.NewUser = {
    userName: '',
    contactNumber: '',
    email: '',
    password: '',
    role: '',
    roleId: '',           // ← add this
    createdBy: '',
    createdAt: new Date().toISOString()
  };
  this.openNewUser = true;
}

onRoleChange(selectedRole: any) {
  this.NewUser.role = selectedRole.roleName;
  this.NewUser.roleId = selectedRole.roleId;   // ← from role summary
}

  closeCreateUserPopup() {
    this.openNewUser = false;
  }

  createUser() {
    if (!this.NewUser.userName?.trim()) {
     this.loadingService.showToast('⚠️ Please enter the Username.', 'warning');
      return;
    }

    if (!this.NewUser.email?.trim()) {
     this.loadingService.showToast('⚠️ Please enter the Email.', 'warning');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.NewUser.email.trim())) {
      this.loadingService.showToast('⚠️ Please enter a valid Email address.', 'warning');
      return;
    }

    if (!this.NewUser.password?.trim()) {
      this.loadingService.showToast('⚠️ Please enter the Password.', 'warning');
      return;
    }

    if (!this.NewUser.contactNumber?.trim()) {
     this.loadingService.showToast('⚠️ Please enter the Contact number.', 'warning');
      return;
    }

    if (!this.NewUser.role) {
     this.loadingService.showToast('⚠️ Please select a Role.', 'warning');
      return;
    }

    const reqBody = { ...this.NewUser };

    this.user.addUser(reqBody).subscribe({
      next: (res: any) => {
        this.loadingService.showToast(res.message || 'User created successfully', 'success');
        this.closeCreateUserPopup();
        this.loadUser();
      },
      error: () => {
        this.loadingService.showToast('Error creating user!', 'error');
      }
    });
  }

UpdateUser = {
  userName: '',
  contactNumber: '',
  email: '',
  password: '',
  role: '',
  roleId: ''    // ← add this
};

  openUpdateUser = false;
  selectedUserId: string = '';

openUpdateUserPopup(user: any) {
  this.loadRole();
  this.selectedUserId = user.id;

  this.UpdateUser = {
    userName: user.userName,
    password: user.password,
    contactNumber: user.contactNumber,
    email: user.email,
    role: user.role,
    roleId: user.roleId    // ← add this
  };

  this.openUpdateUser = true;
}


onUpdateRoleSelect(event: any) {
  const selected = event.target;
  this.UpdateUser.role = selected.value;
  this.UpdateUser.roleId = selected.options[selected.selectedIndex].getAttribute('data-id');
  console.log('Update Role:', this.UpdateUser.role, 'RoleId:', this.UpdateUser.roleId);
}



  closeUpdateUserPopup() {
    this.openUpdateUser = false;
  }

  updateUser() {
    if (!this.UpdateUser.userName?.trim()) {
      this.loadingService.showToast('⚠️ Please enter the Username.', 'warning');
      return;
    }

    if (!this.UpdateUser.email?.trim()) {
    this.loadingService.showToast('⚠️ Please enter the Email.', 'warning');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.UpdateUser.email.trim())) {
  this.loadingService.showToast('⚠️ Please enter a valid Email address.', 'warning');
      return;
    }

    if (!this.UpdateUser.password?.trim()) {
     this.loadingService.showToast('⚠️ Please enter the Password.', 'warning');
      return;
    }

    if (!this.UpdateUser.contactNumber?.trim()) {
      this.loadingService.showToast('⚠️ Please enter the Contact number.', 'warning');
      return;
    }

    if (!this.UpdateUser.role) {
     this.loadingService.showToast('⚠️ Please select a Role.', 'warning');
      return;
    }

    this.user.updateUsers(this.UpdateUser, this.selectedUserId).subscribe({
      next: (res: any) => {
       this.loadingService.showToast(res.message || 'User updated successfully', 'success');
        this.closeUpdateUserPopup();
        this.loadUser();
      },
      error: () => {
       this.loadingService.showToast('Error updating user!', 'error');
      }
    });
  }

  openDeleteUser = false;
  selectUserId: string = '';

  openDeleteUserPopup(user: any) {
    this.selectedUserId = user.id;
    this.openDeleteUser = true;
  }

  closeDeleteUserPopup() {
    this.openDeleteUser = false;
  }

  deleteUser() {
    this.user.DeleteUsers(this.selectedUserId).subscribe({
      next: (res: any) => {
       this.loadingService.showToast(res.message || 'User deleted successfully', 'success');
        this.closeDeleteUserPopup();
        this.loadUser();
      },
      error: () => {
       this.loadingService.showToast('Error deleting user!', 'error');
      }
    })
  }

  roles: any[] = [];

  loadRole() {
    this.roleService.getRole().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading role")
      }
    })
  }






onRoleSelect(event: any) {
  const selected = event.target;
  this.NewUser.role = selected.value;                                                      // → "new one"
  this.NewUser.roleId = selected.options[selected.selectedIndex].getAttribute('data-id'); // → "456"
  console.log('Role:', this.NewUser.role, 'RoleId:', this.NewUser.roleId);
}


}


