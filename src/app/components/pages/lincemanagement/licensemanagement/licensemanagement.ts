import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface License {
  state: string;
  id: string;
  type: string;
  subscriptionEndDate?: string;
  supportEndDate?: string;
  activationDate?: string;
  description?: string;
}

@Component({
  selector: 'app-licensemanagement',
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './licensemanagement.html',
  styleUrl: './licensemanagement.css'
})
export class Licensemanagement {
  customerId = '';
  licenseId = '';
  description = '';
  searchTerm = '';

  licenses: License[] = [
    {
      state: 'Active',
      id: 'LIC-001',
      type: 'ACT',
      subscriptionEndDate: '2025-12-31',
      supportEndDate: '2025-12-31',
      activationDate: '2024-01-01',
      description: 'Main active license'
    },
    {
      state: 'Expired',
      id: 'LIC-002',
      type: 'PSM',
      subscriptionEndDate: '2023-12-31',
      supportEndDate: '2023-12-31',
      activationDate: '2023-01-01',
      description: 'Trial license expired'
    }
  ];

  filteredLicenses: License[] = [...this.licenses];

  activateLicense() {
    alert(`Activated license: ${this.licenseId}`);
  }

  filterLicenses() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLicenses = this.licenses.filter(l =>
      l.id.toLowerCase().includes(term) ||
      l.type.toLowerCase().includes(term) ||
      l.state.toLowerCase().includes(term)
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredLicenses = [...this.licenses];
  }
}