import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
interface Employee {
  objectId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  uid: string;
  project?: string;
  country?: string;
  location?: string;
  area?: string;
  showDropdown?: boolean; // 👈 important for dropdown toggle
}


@Component({
  selector: 'app-historicals',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './historicals.html',
  styleUrl: './historicals.css'
})
export class Historicals implements OnInit {

  employees: Employee[] = [
    {
      objectId: '670d1790182850c60752bab2',
      employeeCode: 'Gemini',
      employeeName: 'Vishak',
      department: 'IT',
      uid: '001',
      project: '',
      country: '',
      location: '',
      area: ''
    },
    {
      objectId: '670d1a34182850c60752bb7b',
      employeeCode: 'Anto',
      employeeName: 'Titus',
      department: 'PIQ Dept',
      uid: '002',
      project: '',
      country: '',
      location: '',
      area: ''
    },
    {
      objectId: '671392cf445962346b4bae7b',
      employeeCode: '1',
      employeeName: 'Emp',
      department: 'IT',
      uid: '003'
    },
    {
      objectId: '671392ee445962346b4bae84',
      employeeCode: '2',
      employeeName: 'Emp',
      department: 'IT',
      uid: '004'
    }
  ];

  filteredEmployees: Employee[] = [];
  searchTerm: string = '';

 ngOnInit() {
    // Initialize with dropdown flag
    this.filteredEmployees = this.employees.map(emp => ({
      ...emp,
      showDropdown: false
    }));
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees
      .filter(emp =>
        Object.values(emp).some(value =>
          value?.toString().toLowerCase().includes(term)
        )
      )
      .map(emp => ({ ...emp, showDropdown: false })); // keep flag after filtering
  }

  toggleDropdown(emp: Employee, event: MouseEvent) {
  event.stopPropagation(); // Prevent click from bubbling to document
  this.filteredEmployees.forEach(e => (e.showDropdown = false));
  emp.showDropdown = !emp.showDropdown;
}


  selectOption(emp: Employee, option: string) {
    emp.showDropdown = false;
    if (option === 'overview') {
      alert(`Overview selected for ${emp.employeeName}`);
    } else if (option === 'detailed') {
      alert(`Detailed selected for ${emp.employeeName}`);
    }
  }

  viewHistory(emp: Employee) {
    alert(`Viewing history for ${emp.employeeName}`);
  }


@HostListener('document:click')
  closeAllDropdowns() {
    this.filteredEmployees.forEach(e => (e.showDropdown = false));
  }

}
