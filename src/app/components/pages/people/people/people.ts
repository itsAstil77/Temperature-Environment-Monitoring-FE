// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-people',
//   imports: [],
//   templateUrl: './people.html',
//   styleUrl: './people.css'
// })
// export class People {

// }


import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Peopleservice } from '../../../service/people/peopleservice';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Peopletype } from '../../../service/peopletype/peopletype';
import { MatTabsModule } from '@angular/material/tabs';
import { NgSelectModule } from '@ng-select/ng-select';






@Component({
  selector: 'app-people',
  imports: [CommonModule, FormsModule, RouterModule, MatTabsModule, NgSelectModule],
  templateUrl: './people.html',
  styleUrls: ['./people.css']
})
export class People implements OnInit {
  ngOnInit(): void {

    this.loadPerson();
    this.Peopletype();
    this.Access();
    this.groups();
    this.tasks();
    this.getManualAttendance()
    this.loadPeopleAndAccess();
    this.loadPeopleThenTasks();
    this.loadDevices();





  }

  // This is a typical Angular tab/page switch handler


  onTabChange(tabName: string) {
    this.activeTab = tabName;

    // ✅ Reset date fields when switching tabs
    this.filterStartDate = '';
    this.filterEndDate = '';

    // (optional) trigger filter refresh or data reload
    this.updateDateInput();
    this.activeTab = tabName;

    // ✅ Clear date fields when leaving the Access tab
    if (tabName !== 'access') {
      this.filterStartDate = '';
      this.filterEndDate = '';
    }
  }



  /* onTabOpen() {
    this.filterStartDate = '';
    this.filterEndDate = '';
  }
   */





  constructor(private people: Peopleservice, private cdr: ChangeDetectorRef, private peopleType: Peopletype, private deviceService: Peopletype) { }
  activeTab: string = 'project';


  setActive(tabName: string) {

    // ✅ When leaving the "Acess" tab → clear the date fields
    if (this.activeTab === 'Acess' && tabName !== 'Acess') {
      this.filterStartDate = '';
      this.filterEndDate = '';
      this.Access();
    }

    // ✅ When leaving the "TaskSchedule" tab
    if (this.activeTab === 'TaskSchedule' && tabName !== 'TaskSchedule') {
      this.filterStartDate = '';
      this.filterEndDate = '';
      this.tasks();
    }

    // ✅ When switching away from "person"
    if (this.activeTab === 'person' && tabName !== 'person') {
      this.filterStartDate = '';
      this.filterEndDate = '';
      this.loadPerson();

    }

    // ✅ When entering "task-schedule"
    /*  if (tabName === 'task-schedule') {
       this.filterStartDate = '';
       this.filterEndDate = '';
       
     } */

    // finally update active tab
    this.activeTab = tabName;

    console.log('Switched to tab:', tabName);
  }



















  // Add properties
  deviceList: any[] = [];
  selectedDevice: any = null;
  deviceSummary: { total: number; active: number; inactive: number } = {
    total: 0,
    active: 0,
    inactive: 0
  };
  // Load devices from device service
  deviceMap: { [key: string]: string } = {};

  loadDevices(): void {
    this.deviceService.getaddDevices().subscribe({
      next: (res: any) => {
        this.deviceList = res.data ? res.data : res;
        this.deviceMap = this.deviceList.reduce((map, d) => {
          map[d.id] = d.deviceName;
          return map;
        }, {} as { [key: string]: string });
        this.cdr.detectChanges();
      }
    });
  }






  getDeviceName(deviceId: string): string {
    if (!deviceId) return '—';
    const device = this.deviceList.find(d => d.id === deviceId);
    return device ? device.deviceName : '—';
  }










  isCreatingPerson: boolean = false;

  openAddPerson = false;
  createPerson: any = {
    firstName: '',
    lastName: '',
    startDate: '',
    endDate: '',
    company: '',
    peopleType: '',
    nationalId: '',
    vehicleId: '',
    idNumber: '',
    designation: '',
    phoneNumber: '',
    cardBatchNumber: '',
    department: '',
    device: ''
  };




  updatePerson: any = {
    firstName: '',
    lastName: '',
    startDate: '',
    endDate: '',
    company: '',
    peopleType: '',
    nationalId: '',
    vehicleId: '',
    idNumber: '',
    designation: '',
    phoneNumber: '',
    cardBatchNumber: '',
    department: '',
    device: ''
  };

  openCreatePersonPopup() {
    this.openAddPerson = true;
    this.createPerson = {
      firstName: "",
      lastName: "",
      startDate: "",
      endDate: "",
      company: "",
      peopleType: "",
      nationalId: "",
      vehicleId: "",
      idNumber: "",
      designation: "",
      phoneNumber: "",
      cardBatchNumber: "",
      device: "",
    }
  }
  closeCreatePersonPopup() {
    this.openAddPerson = false;

  }
  createNewPerson() {
    const isEmpty = (val: any) =>
      val === undefined || val === null || val.toString().trim() === "";

    // Step-by-step validation (first missing → stop)
    if (isEmpty(this.createPerson.firstName)) return alert("⚠️ Enter First Name");
    if (isEmpty(this.createPerson.lastName)) return alert("⚠️ Enter Last Name");
    if (isEmpty(this.createPerson.startDate)) return alert("⚠️ Select Start Date");
    if (isEmpty(this.createPerson.endDate)) return alert("⚠️ Select End Date");
    if (isEmpty(this.createPerson.company)) return alert("⚠️ Enter Company Name");
    if (isEmpty(this.createPerson.peopleType)) return alert("⚠️ Select People Type");
    if (isEmpty(this.createPerson.nationalId)) return alert("⚠️ Enter National ID");
    if (isEmpty(this.createPerson.vehicleId)) return alert("⚠️ Enter Vehicle ID");
    if (isEmpty(this.createPerson.idNumber)) return alert("⚠️ Enter ID Number");
    if (isEmpty(this.createPerson.designation)) return alert("⚠️ Enter Designation");
    if (isEmpty(this.createPerson.phoneNumber)) return alert("⚠️ Enter Phone Number");
    if (isEmpty(this.createPerson.cardBatchNumber)) return alert("⚠️ Enter Card Batch Number");

    // ⭐ NEW: Device field validation
    if (isEmpty(this.createPerson.device)) return alert("⚠️ Select a Device");

    // Prevent double submission
    if (this.isCreatingPerson) return;
    this.isCreatingPerson = true;

    this.people.createNewPerson(this.createPerson).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ Person Created Successfully");

        // include device name in list after creation
        const newPerson = {
          ...res,
          device: this.createPerson.device
        };

        this.personList.unshift(newPerson);
        this.filteredPersonList.unshift(newPerson);


        this.openAddPerson = false;
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 10);

        // Reset form
        this.createPerson = {
          firstName: "",
          lastName: "",
          startDate: "",
          endDate: "",
          company: "",
          peopleType: "",
          nationalId: "",
          vehicleId: "",
          idNumber: "",
          designation: "",
          phoneNumber: "",
          cardBatchNumber: "",
          device: ""
        };
      },
      error: () => {
        alert("❌ Error creating person");
      },
      complete: () => {
        this.isCreatingPerson = false;
      }
    });
  }








  // UPDATE PERSON


  openUpdatePerson = false;
  selectedPersonId: string = '';

  openUpdatePersonPopup(person: any) {
    this.selectedPersonId = person.id;

    const formatDate = (isoDate: string) => {
      if (!isoDate) return '';
      return new Date(isoDate).toISOString().split('T')[0];
    };

    this.updatePerson = {
      firstName: person.firstName,
      lastName: person.lastName,
      startDate: formatDate(person.startDate),
      endDate: formatDate(person.endDate),
      company: person.company,
      peopleType: person.peopleType,
      nationalId: person.nationalId,
      vehicleId: person.vehicleId,
      idNumber: person.idNumber,
      designation: person.designation,
      phoneNumber: person.phoneNumber,
      cardBatchNumber: person.cardBatchNumber,
      device: person.device
    };

    this.openUpdatePerson = true;
  }


  closeUpdatePersonPopup() {
  this.openUpdatePerson = false;

  setTimeout(() => {
    this.cdr.detectChanges();
  }, 10);
}

  personUpdate() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";

    if (missingFields.length) {
      alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
      return;
    }

    this.people.updatePerson(this.updatePerson, this.selectedPersonId).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ User Updated successfully");

        // ⭐⭐ IMPORTANT: attach device manually (backend not sending it)
        res.device = this.updatePerson.device;

        // ⭐⭐ Update the person list without full reload
        const index = this.personList.findIndex(p => p.id === this.selectedPersonId);
        if (index !== -1) {
          this.personList[index] = { ...this.personList[index], ...res };
        }

        const filteredIndex = this.filteredPersonList.findIndex(p => p.id === this.selectedPersonId);
        if (filteredIndex !== -1) {
          this.filteredPersonList[filteredIndex] = { ...this.filteredPersonList[filteredIndex], ...res };
        }

        this.closeUpdatePersonPopup();
      },
      error: () => {
        alert("❌ Error updating user");
      }
    });
  }




  //DELETE PEOPLE 




  openDeletePerson = false;


  selectedPersonsId: string = '';

  openDeletePersonPopup(people: any) {
    this.selectedPersonsId = people.id;
    this.openDeletePerson = true;
  }

  closeDeletePersonPopup() {
    this.openDeletePerson = false;
  }

  personDelete() {
    this.people.DeletePerson(this.selectedPersonsId).subscribe({
      next: (res: any) => {
        alert(res.message || 'Person Deleted successfully');
        this.closeDeletePersonPopup();
        this.loadPerson();
      },
      error: () => {
        alert("error Deleting person")
      }
    })
  }



  editPersonSearch: string = '';


  showCalendar = false;
  filterStartDate: string = '';
  filterEndDate: string = '';
  personList: any[] = [];          // Original data
  filteredPersonList: any[] = [];  // Data used in template
  personSearch: string = '';       // Search text








  loadPerson(pageNumber: number = 1) {
    this.currentPage = pageNumber;

    this.people.getPerson(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        // ✅ Assuming your API returns { data: [], totalPages: number }
        this.personList = Array.isArray(res.data) ? res.data : [];
        this.filteredPersonList = [...this.personList];

        this.totalPages = res.totalPages || 1;

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading person', err)
    });
  }










  updateDateInput() {
    this.showCalendar = false;
    this.searchPerson();
  }

  searchPerson() {
    const searchLower = this.personSearch.trim().toLowerCase();
    let filtered = [...this.personList];

    // 🔍 Text search
    if (searchLower) {
      filtered = filtered.filter(person => {
        return (
          (person.firstName && person.firstName.toLowerCase().includes(searchLower)) ||
          (person.lastName && person.lastName.toLowerCase().includes(searchLower)) ||
          (person.company && person.company.toLowerCase().includes(searchLower)) ||
          (person.peopleType && person.peopleType.toLowerCase().includes(searchLower)) ||
          (person.nationalId && person.nationalId.toLowerCase().includes(searchLower)) ||
          (person.vehicleId && person.vehicleId.toLowerCase().includes(searchLower)) ||
          (person.idNumber && person.idNumber.toLowerCase().includes(searchLower)) ||
          (person.designation && person.designation.toLowerCase().includes(searchLower)) ||
          (person.phoneNumber && person.phoneNumber.toLowerCase().includes(searchLower)) ||
          (person.cardBatchNumber && person.cardBatchNumber.toLowerCase().includes(searchLower))
        );
      });
    }

    function formatLocalDate(date: string | Date): string {
      let d = new Date(date);
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
    }

    // In your filter function:
    if (this.filterStartDate || this.filterEndDate) {
      filtered = filtered.filter(person => {
        if (!person.startDate) return false;

        const formatYMD = (d: string | Date) => {
          const date = new Date(d);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const personStart = formatYMD(person.startDate);
        const personEnd = person.endDate ? formatYMD(person.endDate) : personStart;

        const filterStart = this.filterStartDate ? formatYMD(this.filterStartDate) : '';
        const filterEnd = this.filterEndDate ? formatYMD(this.filterEndDate) : '';

        // Both set and different -> only match exact (start == filterStart && end == filterEnd)
        if (filterStart && filterEnd && filterStart !== filterEnd) {
          return personStart === filterStart && personEnd === filterEnd;
        }
        // Both set and same day: match if either boundary equals filter day
        if (filterStart && filterEnd && filterStart === filterEnd) {
          return personStart === filterStart || personEnd === filterStart;
        }
        // Only start: match exactly
        if (filterStart) return personStart === filterStart || personEnd === filterStart;
        // Only end: match exactly
        if (filterEnd) return personStart === filterEnd || personEnd === filterEnd;

        return false;
      });
    }

    // else, skip the date filter entirely


    this.filteredPersonList = filtered;




  }





  //dropdown




  getPersonDisplay(personId: string): string {
    const person = this.personList.find(p => p.id === personId);
    return person ? `${person.idNumber}` : personId;
  }




  get filteredEditPersonList() {
    if (!this.editPersonSearch) return this.personList;
    const search = this.editPersonSearch.toLowerCase();
    return this.personList.filter(p =>
      p.firstName.toLowerCase().includes(search) ||
      p.lastName.toLowerCase().includes(search) ||
      p.idNumber?.toString().toLowerCase().includes(search)
    );
  }



  //people Type

  peopleTypeList: any[] = [];
  filteredPeopleTypeList: any[] = [];
  peopleTypeSearch: string = '';

  Peopletype(pageNumber: number = 1) {
    this.currentPage = pageNumber;

    this.peopleType.getPeopleType(pageNumber, this.pageSize).subscribe({
      next: (res: any) => {
        // Assuming API returns { data: [], totalPages: number }
        this.peopleTypeList = Array.isArray(res.data) ? res.data : [];

        this.filteredPeopleTypeList = [...this.peopleTypeList];
        this.totalPages = res.totalPages || 1;

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Error loading people type", err)
    });
  }




  nextPeopleTypePage() {
    if (this.currentPage < this.totalPages) {
      this.Peopletype(this.currentPage + 1);
    }
  }

  prevPeopleTypePage() {
    if (this.currentPage > 1) {
      this.Peopletype(this.currentPage - 1);
    }
  }







  searchPeopleType() {
    const searchLower = this.peopleTypeSearch.trim().toLowerCase();
    if (!searchLower) {
      this.filteredPeopleTypeList = [...this.peopleTypeList];
      return;
    }
    this.filteredPeopleTypeList = this.peopleTypeList.filter(pt =>
      (pt.typeName && pt.typeName.toLowerCase().includes(searchLower)) ||
      (pt.description && pt.description.toLowerCase().includes(searchLower))
    );
  }


  // create peopleType

  openCreatePeopleType = false;

  createpeopletype: any = {
    typeName: '',
    description: '',
  };

  openCreatePeopleTypePopup() {
    this.openCreatePeopleType = true;

    this.createpeopletype = {
      typeName: '',
      description: '',
    }

  }
  closecreatepeopleType() {
    this.openCreatePeopleType = false;
  }
  isCreatingPeopleType: boolean = false;
  createNewPeopleType() {
    const isEmpty = (val: any) =>
      val === undefined || val === null || val.toString().trim() === "";

    // ⭐ Step-by-step validation
    if (isEmpty(this.createpeopletype.typeName))
      return alert("⚠️ Please enter Type Name");

    if (isEmpty(this.createpeopletype.description))
      return alert("⚠️ Please enter Description");

    // Prevent double submission
    if (this.isCreatingPeopleType) return;
    this.isCreatingPeopleType = true;

    this.peopleType.createNewPeopleType(this.createpeopletype).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ People Type Created Successfully");
        this.closecreatepeopleType();

        const newType = {
          ...res,
          createdAt: new Date()
        };

        this.peopleTypeList.unshift(newType);
        this.filteredPeopleTypeList.unshift(newType);

        // Reset form
        this.createpeopletype = {
          typeName: "",
          description: "",
        };

        this.cdr.detectChanges();
      },

      error: () => {
        alert("❌ Error creating People Type");
      },

      complete: () => {
        this.isCreatingPeopleType = false;
      }
    });
  }





  //update people type
  openUpdatePeopleType = false;
  selectedPeopleTypeId: string = '';


  updatePeopleType: any = {
    typeName: '',
    description: '',

  }

  openUpdatePeopleTypePopup(peopleType: any) {
    this.selectedPeopleTypeId = peopleType.id;
    this.updatePeopleType = {
      typeName: peopleType.typeName,
      description: peopleType.description
    }
    this.openUpdatePeopleType = true
  }
  closeUpdatePeopleTypePopup() {
    this.openUpdatePeopleType = false
  }

  peopleTypeUpdate() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";

    // ✅ Validate required fields individually
    if (isEmpty(this.updatePeopleType.typeName)) missingFields.push("Type Name");
    if (isEmpty(this.updatePeopleType.description)) missingFields.push("Description");
    // Add other fields here if needed, e.g., status

    // ✅ Stop if any field is missing
    if (missingFields.length) {
      alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
      return;
    }

    // ✅ Proceed with API call
    this.peopleType.updatePeopleType(this.updatePeopleType, this.selectedPeopleTypeId).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ People Type Updated Successfully");
        this.closeUpdatePeopleTypePopup();
        this.Peopletype(); // refresh list
      },
      error: (err) => {
        console.error("Error updating People Type:", err);
        alert("❌ Error updating People Type");
      }
    });
  }




  //delete people type

  openDeletePeopleType = false;


  selectedPeopleType: string = '';

  openDeletePeopleTypePopup(peopleType: any) {
    this.selectedPeopleType = peopleType.id;
    this.openDeletePeopleType = true;
  }

  closeDeletePeopleTypePopup() {
    this.openDeletePeopleType = false;
  }

  deletePeopleType() {
    this.peopleType.DeletePeopleType(this.selectedPeopleType).subscribe({
      next: (res: any) => {
        alert(res.message || 'People Type Deleted successfully');
        this.closeDeletePeopleTypePopup();
        this.Peopletype();
      },
      error: () => {
        alert("error Deleting people Type")
      }
    })
  }
























  accessSearch: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizes: number[] = [5, 10, 20, 50];
  totalPages: number = 0;
  AccessList: any[] = [];
  filteredAccessList: any[] = [];



  peopleList: any[] = [];






  loadPeopleAndAccess() {
    // 1️⃣ Load all people first
    this.people.getPerson().subscribe({
      next: (res: any) => {
        // Make sure to use res.data if your API returns { data: [...] }
        this.peopleList = Array.isArray(res.data) ? res.data : res;

        // 2️⃣ Now load access summary
        this.Access();
      },
      error: (err) => console.error('Error loading people list', err)
    });
  }

  Access() {
    this.peopleType.getAccess(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.AccessList = Array.isArray(res.data) ? res.data : [];

        // Map groupMembers IDs → "First Last (idNumber)"
        this.filteredAccessList = this.AccessList.map((access: any) => {
          const memberNames = (access.groupMembers || []).map((memberId: string) => {
            const person = this.peopleList.find(p => p.id === memberId);
            if (person) {
              // ✅ Include full name + idNumber if available
              return `${person.firstName || ''} ${person.lastName || ''} (${person.idNumber || memberId})`.trim();
            }
            // fallback if no matching person found
            return memberId;
          });

          return {
            ...access,
            groupMembers: memberNames
          };
        });

        this.totalPages = res.totalPages || 1;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading access', err);
        this.AccessList = [];
        this.filteredAccessList = [];
      }
    });
  }






  // Navigate to a specific page
  loadAccessPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.Access();
  }

  // Helper to reset to first page
  loadFirstAccessPage() {
    this.currentPage = 1;
    this.Access();
  }





  searchAccess() {
    const searchLower = this.accessSearch?.trim().toLowerCase() || '';
    let filtered = [...this.AccessList];

    // 1️⃣ Text search filter
    if (searchLower) {
      filtered = filtered.filter(access =>
        (access.groupName && access.groupName.toLowerCase().includes(searchLower)) ||
        (access.status && access.status.toLowerCase().includes(searchLower)) ||
        (access.peopleType && access.peopleType.toLowerCase().includes(searchLower)) ||
        (Array.isArray(access.groupMembers) && access.groupMembers.join(',').toLowerCase().includes(searchLower)) ||
        (Array.isArray(access.readers) && access.readers.join(',').toLowerCase().includes(searchLower))
      );
    }

    // 2️⃣ Date parser
    const parseDate = (d: string | Date): number | null => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    };

    const startTime = this.filterStartDate ? parseDate(this.filterStartDate) : null;
    const endTime = this.filterEndDate ? parseDate(this.filterEndDate) : null;

    // If no date filters, return all
    if (!startTime && !endTime) {
      this.filteredAccessList = filtered;
      return;
    }

    // 3️⃣ Exact date match filter
    const matches: any[] = [];

    for (const access of filtered) {
      if (!access.fromDate) continue;

      const accessFromTime = parseDate(access.fromDate);
      const accessToTime = access.toDate ? parseDate(access.toDate) : null;
      if (accessFromTime === null) continue;

      let isMatch = false;

      // ✅ Only Start Date selected — exact match to fromDate
      if (startTime && !endTime) {
        isMatch = accessFromTime === startTime;
      }
      // ✅ Only End Date selected — exact match to toDate (or fromDate if no toDate)
      else if (!startTime && endTime) {
        isMatch = (accessToTime ?? accessFromTime) === endTime;
      }
      // ✅ Both Start & End Dates selected — exact match to both
      else if (startTime && endTime) {
        isMatch =
          accessFromTime === startTime &&
          (accessToTime ?? accessFromTime) === endTime;
      }

      if (isMatch) matches.push(access);
    }

    this.filteredAccessList = matches;
    console.log('Exact date matches:', this.filteredAccessList);
  }

  //date





  selectedUpdateGroupMembers: string[] = [];

  // This will hold members for display somewhere else on the screen
  displayGroupMembers: string[] = [];


  onUpdateGroupChange() {
    // Find the selected group from your groups summary
    const selectedGroup = this.groupsList.find(
      g => g.groupName === this.updateAccess.groupName
    );

    if (selectedGroup) {
      // Update members array in updateAccess automatically
      this.updateAccess.groupMembers = [...selectedGroup.members];

      // Also update the display variable if you want to show it outside popup
      this.displayGroupMembers = [...selectedGroup.members];

      // Convert array → comma string for input field if you are still using it
      this.groupMembersInput = selectedGroup.members.join(', ');
    } else {
      this.updateAccess.groupMembers = [];
      this.displayGroupMembers = [];
      this.groupMembersInput = '';
    }
  }





  // create Access

  openCreateaccess = false;

  createaccess: any = {
    groupName: '',
    groupMembers: [] as string[],
    peopleType: '',
    readers: [] as string[],
    status: '',
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: ''
  };


  openCreateaccessPopup() {
    this.openCreateaccess = true;
    this.createaccess = {
      groupName: '',
      groupMembers: [] as string[],
      peopleType: '',
      readers: [] as string[],
      status: '',
      fromDate: '',
      toDate: '',
      fromTime: '',
      toTime: ''
    };

    // 🔥 clear temporary input fields too
    this.groupMembersInput = '';
    this.readersInput = '';


  }
  closecreateaccess() {
    this.openCreateaccess = false;
  }
  groupMembersInput: string = '';
  readersInput: string = '';
  createNewaccess() {
    const isEmpty = (val: any) =>
      val === undefined || val === null || val.toString().trim() === "";

    // Ensure arrays are initialized
    this.createaccess.groupMembers = this.createaccess.groupMembers || [];
    this.createaccess.readers = this.readersInput
      ? this.readersInput.split(',').map(x => x.trim())
      : [];

    // ⭐ Step-by-step validation (stops immediately)
    if (isEmpty(this.createaccess.groupName))
      return alert("⚠️ Please enter Group Name");

    if (isEmpty(this.createaccess.peopleType))
      return alert("⚠️ Please select People Type");

    if (!this.createaccess.groupMembers.length)
      return alert("⚠️ Please add at least one Group Member");

    if (!this.createaccess.readers.length)
      return alert("⚠️ Please add at least one Reader");

    if (isEmpty(this.createaccess.fromDate))
      return alert("⚠️ Please select From Date");

    if (isEmpty(this.createaccess.toDate))
      return alert("⚠️ Please select To Date");

    if (isEmpty(this.createaccess.fromTime))
      return alert("⚠️ Please select From Time");

    if (isEmpty(this.createaccess.toTime))
      return alert("⚠️ Please select To Time");

    if (isEmpty(this.createaccess.status))
      return alert("⚠️ Please select Status");


    // ⭐ Prepare payload
    const payload = {
      groupName: this.createaccess.groupName,
      groupMembers: this.createaccess.groupMembers,
      peopleType: this.createaccess.peopleType,
      readers: this.createaccess.readers,
      status: this.createaccess.status ? "Active" : "Inactive",
      fromDate: new Date(this.createaccess.fromDate + 'T' + this.createaccess.fromTime).toISOString(),
      toDate: new Date(this.createaccess.toDate + 'T' + this.createaccess.toTime).toISOString(),
      fromTime: this.createaccess.fromTime,
      toTime: this.createaccess.toTime
    };

    // ⭐ Call API
    this.peopleType.createNewAcess(payload).subscribe({
      next: () => {
        alert("✅ Access Created Successfully");
        this.closecreateaccess();

        setTimeout(() => {
          this.createaccess = {
            groupName: '',
            groupMembers: [],
            peopleType: '',
            readers: [],
            status: false,
            fromDate: '',
            toDate: '',
            fromTime: '',
            toTime: ''
          };
        }, 0);

        this.Access();
      },

      error: (err) => {
        console.error("Error creating access:", err);
        alert("❌ Error creating access");
      }
    });
  }











  //update access

  openUpdateAccess: boolean = false;
  selectedAccess: string = '';

  updateAccess: any = {
    groupName: '',
    groupMembersInput: '',   // ✅ add this
    readersInput: '',        // ✅ add this
    groupMembers: [] as string[],
    peopleType: '',
    readers: [] as string[],
    status: '',
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: ''
  };

  openUpdateAccessPopup(access: any) {
    console.log("Update popup opened for:", access);
    this.selectedAccess = access.id;
    this.openUpdateAccess = true;

    this.updateAccess = {
      groupName: access.groupName || '',
      groupMembers: access.groupMembers || [],
      peopleType: access.peopleType || '',
      readers: access.readers || [],
      status: access.status || '',
      fromDate: access.fromDate ? access.fromDate.split('T')[0] : '',
      toDate: access.toDate ? access.toDate.split('T')[0] : '',
      fromTime: access.fromTime || '',
      toTime: access.toTime || ''
    };

    // convert arrays → comma separated strings for inputs
    this.groupMembersInput = this.updateAccess.groupMembers.join(', ');
    this.readersInput = this.updateAccess.readers.join(', ');

    this.openUpdateAccess = true; // ✅ this must be set
  }

  closeUpdateAccessPopup() {
    this.openUpdateAccess = false;
  }

  AccessUpdate() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";

    // ✅ Convert inputs to arrays safely
    this.updateAccess.groupMembers = this.groupMembersInput
      ? this.groupMembersInput.split(',').map((x: string) => x.trim())
      : [];
    this.updateAccess.readers = this.readersInput
      ? this.readersInput.split(',').map((x: string) => x.trim())
      : [];

    // ✅ Validate each required field
    if (isEmpty(this.updateAccess.groupName)) missingFields.push("Group Name");
    if (isEmpty(this.updateAccess.peopleType)) missingFields.push("People Type");
    if (!this.updateAccess.groupMembers.length) missingFields.push("Group Members");
    if (!this.updateAccess.readers.length) missingFields.push("Readers");
    if (!this.updateAccess.status) missingFields.push("Status");
    if (isEmpty(this.updateAccess.fromDate)) missingFields.push("From Date");
    if (isEmpty(this.updateAccess.toDate)) missingFields.push("To Date");
    if (isEmpty(this.updateAccess.fromTime)) missingFields.push("From Time");
    if (isEmpty(this.updateAccess.toTime)) missingFields.push("To Time");

    // Stop if any required field is missing
    if (missingFields.length) {
      alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
      return;
    }

    // ✅ Prepare payload with safe date conversion
    const payload = {
      groupName: this.updateAccess.groupName,
      groupMembers: this.updateAccess.groupMembers,
      peopleType: this.updateAccess.peopleType,
      readers: this.updateAccess.readers,
      status: this.updateAccess.status ? 'Active' : 'Inactive', // send as string
      fromDate: new Date(this.updateAccess.fromDate + 'T' + this.updateAccess.fromTime).toISOString(),
      toDate: new Date(this.updateAccess.toDate + 'T' + this.updateAccess.toTime).toISOString(),
      fromTime: this.updateAccess.fromTime,
      toTime: this.updateAccess.toTime
    };

    // ✅ Call API
    this.peopleType.updateaccess(payload, this.selectedAccess).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ Access Updated Successfully");
        this.closeUpdateAccessPopup();

        // Reset form after closing popup (optional, you can comment if not needed)
        setTimeout(() => {
          this.updateAccess = {
            groupName: '',
            groupMembers: [],
            peopleType: '',
            readers: [],
            status: false,
            fromDate: '',
            toDate: '',
            fromTime: '',
            toTime: ''
          };
        }, 0);

        this.Access(); // refresh access list
      },
      error: (err) => {
        console.error("Error updating access:", err);
        alert("❌ Error updating access");
      }
    });
  }



  //delete access


  openDeleteAccess = false;




  openDeleteaccessPopup(access: any) {

    this.selectedAccess = access.id;
    this.openDeleteAccess = true;
  }

  closeDeleteaccessPopup() {
    this.openDeleteAccess = false;
  }

  deleteaccess() {
    this.peopleType.DeleteAccess(this.selectedAccess).subscribe({
      next: (res: any) => {
        alert(res.message || 'access Deleted successfully');
        this.closeDeleteaccessPopup();
        this.Access();
      },
      error: () => {
        alert("error access")
      }
    })
  }




  //Group





  groupsList: any[] = [];
  filteredGroupsList: any[] = [];
  groupsSearch: string = '';

  groups(pageNumber: number = 1) {
    this.peopleType.getGroup(pageNumber, this.pageSize).subscribe({
      next: (res: any) => {
        // Assuming API returns { data: [], totalPages: number }
        this.groupsList = Array.isArray(res.data) ? res.data : [];
        this.filteredGroupsList = [...this.groupsList]; // initialize search list
        this.totalPages = res.totalPages || 1;
        this.currentPage = pageNumber;

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error loading groups", err);
        this.groupsList = [];
        this.filteredGroupsList = [];
      }
    });
  }



  nextGroupPage() {
    if (this.currentPage < this.totalPages) {
      this.groups(this.currentPage + 1);
    }
  }

  prevGroupPage() {
    if (this.currentPage > 1) {
      this.groups(this.currentPage - 1);
    }
  }

  onGroupPageSizeChange(size: number) {
    this.pageSize = size;
    this.groups(1); // reset to first page
  }


  searchGroups() {
    const searchLower = this.groupsSearch.trim().toLowerCase();
    if (!searchLower) {
      this.filteredGroupsList = [...this.groupsList];
      return;
    }
    this.filteredGroupsList = this.groupsList.filter(group =>
      (group.groupName && group.groupName.toLowerCase().includes(searchLower)) ||
      (group.members && Array.isArray(group.members) && group.members.join(', ').toLowerCase().includes(searchLower)) ||
      (group.members && typeof group.members === 'string' && group.members.toLowerCase().includes(searchLower)) ||
      (group.peopleType && group.peopleType.toLowerCase().includes(searchLower))
    );
  }


  // onGroupMemberSelect(event: any) {

  //   console.log('Selected member ID:', this.creategroups.members);
  //   // Additional logic if needed
  // }


  onGroupMemberSelect(event: Event) {
    const select = event.target as HTMLSelectElement;

    // ✅ Convert selected <option> elements to an array of their values
    const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);

    // ✅ Update the model
    this.creategroups.members = selectedOptions;

    console.log('Selected member IDs:', this.creategroups.members);
  }



  selectedCreateGroupMembers: string[] = [];

  onCreateGroupChange() {
    const selectedGroup = this.groupsList.find(g => g.groupName === this.createaccess.groupName);
    if (selectedGroup) {
      // populate members if you want
      this.selectedCreateGroupMembers = selectedGroup.members;
      this.createaccess.groupMembers = [...selectedGroup.members]; // pre-select all
    } else {
      this.selectedCreateGroupMembers = [];
      this.createaccess.groupMembers = [];
    }
  }



  getMemberNames(memberIds: string[]): string {
    if (!memberIds || memberIds.length === 0) return '—';

    // Map each ID to a person's full name (from your personList)
    const names = memberIds.map(id => {
      const person = this.personList.find(p => p.id === id);
      return person ? `${person.firstName} ${person.lastName}` : id; // fallback to ID
    });

    return names.join(', ');
  }
  getMemberNamesWithIds(memberIds: string[]): string {
    if (!memberIds || memberIds.length === 0) return '—';

    const members = memberIds.map(id => {
      const person = this.personList.find(p => p.id === id);
      if (person) {
        return `${person.firstName} ${person.lastName} (${person.idNumber || id})`;
      }
      return id; // fallback if person not found
    });

    return members.join(', ');
  }






  // create groupsList

  openCreategroups = false;

  creategroups: any = {
    groupName: '',
    members: [] as string[],
    peopleType: ''
  };

  openCreategroupsPopup() {
    this.openCreategroups = true;

    this.creategroups = {
      groupName: '',
      members: [] as string[],
      peopleType: ''
    }

  }
  closecreategroups() {
    this.openCreategroups = false;
  }

  createNewgroups() {
    const isEmpty = (val: any) =>
      val === undefined || val === null || val.toString().trim() === "";

    // Convert members from comma-separated string → array
    if (typeof this.creategroups.members === 'string') {
      this.creategroups.members = this.creategroups.members
        .split(',')
        .map((m: string) => m.trim())
        .filter((m: string) => m !== "");
    }

    // ⭐ Step-by-step validation (stop on first error)
    if (isEmpty(this.creategroups.groupName))
      return alert("⚠️ Please enter Group Name");

    if (isEmpty(this.creategroups.peopleType))
      return alert("⚠️ Please select People Type");

    if (!this.creategroups.members || this.creategroups.members.length === 0)
      return alert("⚠️ Please add at least one Member");

    // ⭐ API call
    this.peopleType.createGroups(this.creategroups).subscribe({
      next: (res: any) => {
        alert("✅ Group Created Successfully");
        this.closecreategroups();

        // Reset form
        this.creategroups = {
          groupName: '',
          peopleType: '',
          members: []
        };

        this.groups(); // refresh group list
      },
      error: (err) => {
        console.error("Error creating group:", err);
        alert("❌ Error creating group");
      }
    });
  }




  // groups update


  openUpdategroups: boolean = false;
  selectedgroupsId: string = '';

  updategroups: any = {
    groupName: '',
    members: [] as string[],
    peopleType: ''
  };

  // inputs for comma-separated editing
  membersInput: string = '';


  onUpdateGroupMemberSelect(event: any) {
    const selectedId = event.target.value;
    const selectedPerson = this.personList.find(p => p.id === selectedId);
    this.updategroups.members = [selectedId]; // ✅ always an array

    if (selectedPerson) {
      this.updategroups.members = [selectedPerson.id]; // or push if multiple allowed
      console.log('Selected member for update:', selectedPerson);
    }
  }


  openUpdateGroupsPopup(groups: any) {
    console.log("Update popup opened for group:", groups);
    this.selectedgroupsId = groups.id;

    this.updategroups = {
      groupName: groups.groupName || '',
      members: groups.members || [],
      peopleType: groups.peopleType || ''
    };

    // ✅ deep copy to prevent modifying main list
    this.updategroups = JSON.parse(JSON.stringify(groups));

    // convert array → string for input

    // convert array → string for input
    this.membersInput = this.updategroups.members?.join(', ') || '';
    this.openUpdategroups = true;
  }

  closeUpdategroupsPopup() {
    this.openUpdategroups = false;
  }

  groupsUpdate() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";

    if (isEmpty(this.updategroups.groupName)) missingFields.push("Group Name");
    if (isEmpty(this.updategroups.peopleType)) missingFields.push("People Type");
    if (!this.updategroups.members || this.updategroups.members.length === 0) missingFields.push("Members");

    if (missingFields.length) {
      alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
      return;
    }

    // ✅ Always send array for members
    const membersArray = Array.isArray(this.updategroups.members)
      ? this.updategroups.members
      : [this.updategroups.members];

    const payload = {
      groupName: this.updategroups.groupName,
      members: membersArray,
      peopleType: this.updategroups.peopleType
    };

    console.log("Final payload:", payload);

    this.peopleType.updateGroups(payload, this.selectedgroupsId).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ Group Updated Successfully");
        this.closeUpdategroupsPopup();
        this.updategroups = { groupName: '', peopleType: '', members: [] };
        this.groups();
      },
      error: (err) => {
        console.error("Error updating group:", err);
        alert("❌ Error updating group");
      }
    });
  }







  //delete group type

  openDeleteGroup = false;
  selectedGroupId: string = '';

  openDeleteGroupPopup(group: any) {
    this.selectedGroupId = group.id;
    this.openDeleteGroup = true;
  }

  closeDeleteGroupPopup() {
    this.openDeleteGroup = false;
  }

  deleteGroup() {
    this.peopleType.DeleteGroups(this.selectedGroupId).subscribe({
      next: (res: any) => {
        alert(res.message || 'Group deleted successfully');
        this.closeDeleteGroupPopup();
        this.groups(); // refresh the list
      },
      error: () => {
        alert("Error deleting group");
      }
    });
  }






  //task

  tasksList: any[] = [];
  filteredTasksList: any[] = [];
  tasksSearch: string = '';

  tasks(pageNumber: number = 1) {
    this.peopleType.gettask(pageNumber, this.pageSize).subscribe({
      next: (res: any) => {
        // Assuming API returns { data: [], totalPages: number }
        this.tasksList = Array.isArray(res.data) ? res.data : [];

        // Map groupMembers IDs → "First Last (idNumber)"
        this.filteredTasksList = this.tasksList.map((task: any) => {
          const memberNames = (task.groupMembers || []).map((memberId: string) => {
            const person = this.peopleList.find(p => p.id === memberId);
            if (person) {
              return `${person.firstName || ''} ${person.lastName || ''} (${person.idNumber || memberId})`.trim();
            }
            return memberId; // fallback if no match
          });

          return {
            ...task,
            groupMembers: memberNames
          };
        });

        this.totalPages = res.totalPages || 1;
        this.currentPage = pageNumber;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error loading tasks", err);
        this.tasksList = [];
        this.filteredTasksList = [];
      }
    });
  }


  loadPeopleThenTasks() {
    this.people.getPerson().subscribe({
      next: (res: any) => {
        // Store people
        this.peopleList = Array.isArray(res.data) ? res.data : res;
        // ✅ Now load tasks after people are ready
        this.tasks();
      },
      error: (err) => console.error("Error loading people", err)
    });
  }


  nextTaskPage() {
    if (this.currentPage < this.totalPages) {
      this.tasks(this.currentPage + 1);
    }
  }

  prevTaskPage() {
    if (this.currentPage > 1) {
      this.tasks(this.currentPage - 1);
    }
  }

  onTaskPageSizeChange(size: number) {
    this.pageSize = size;
    this.tasks(1); // reset to first page
  }





  searchTasks() {
    const searchLower = this.tasksSearch?.trim().toLowerCase() || '';
    const hasStart = !!this.filterStartDate;
    const hasEnd = !!this.filterEndDate;

    let filtered = [...this.tasksList];

    // 🔍 Text search
    if (searchLower) {
      filtered = filtered.filter(task =>
        (task.taskName && task.taskName.toLowerCase().includes(searchLower)) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        (task.groupName && task.groupName.toLowerCase().includes(searchLower)) ||
        (task.groupMembers && Array.isArray(task.groupMembers) && task.groupMembers.join(', ').toLowerCase().includes(searchLower)) ||
        (task.scheduleType && task.scheduleType.toLowerCase().includes(searchLower)) ||
        (task.status && task.status.toLowerCase().includes(searchLower))
      );
    }

    // 🗓️ Date filtering
    if (hasStart || hasEnd) {
      filtered = filtered.filter(task => {
        if (!task.fromDate) return false;

        // Use your date format (yyyy-mm-dd for both the task and filter)
        const formatYMD = (d: string | Date) => {
          const date = new Date(d);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const taskStart = formatYMD(task.fromDate);
        const taskEnd = task.toDate ? formatYMD(task.toDate) : taskStart;

        const start = hasStart ? formatYMD(this.filterStartDate) : '';
        const end = hasEnd ? formatYMD(this.filterEndDate) : '';

        // If both start and end filters chosen & equal: match exactly
        if (start && end && start === end) {
          return taskStart === start || taskEnd === start;
        }
        // If start and end form a range: only match tasks whose range is exactly the filter range
        if (start && end && start !== end) {
          return (taskStart === start && taskEnd === end);
        }
        // Only start filter: match tasks whose start or end date matches the picked date
        if (start && !end) {
          return taskStart === start || taskEnd === start;
        }
        // Only end filter: match tasks whose start or end date matches picked date
        if (!start && end) {
          return taskStart === end || taskEnd === end;
        }
        return true;
      });
    }


    this.filteredTasksList = filtered;
  }





  selectedTaskGroupMembers: string[] = []; // holds members for dropdown


  onCreateTaskGroupChange() {
    const selectedGroup = this.groupsList.find(
      g => g.groupName === this.createTask.groupName
    );

    if (selectedGroup) {
      // ✅ Populate the dropdown
      this.selectedTaskGroupMembers = selectedGroup.members || [];

      // ✅ Automatically select all members
      this.createTask.groupMembers = [...selectedGroup.members];
    } else {
      this.selectedTaskGroupMembers = [];
      this.createTask.groupMembers = [];
    }
  }





  // create task

  openCreateTask = false;

  createTask: any = {
    taskName: '',
    description: '',
    groupName: '',
    groupMembers: [] as string[],
    scheduleType: '',
    status: '',
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: ''
  };

  // Open the Create Task popup and reset the form
  openCreateTaskPopup() {
    this.openCreateTask = true;

    this.createTask = {
      taskName: '',
      description: '',
      groupName: '',
      groupMembers: [],
      scheduleType: '',
      status: '',
      fromDate: '',
      toDate: '',
      fromTime: '',
      toTime: ''
    };

    this.groupMembersInput = '';
    this.groups(); // load the latest groups
  }

  // Close the Create Task popup
  closeCreateTaskPopup() {
    this.openCreateTask = false;
  }


  // temporary input for comma-separated members


  createNewTask() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";
    // 🔹 One-by-one validation
    if (isEmpty(this.createTask.taskName)) {
      alert("⚠️ Task Name is required");
      return;
    }

    if (isEmpty(this.createTask.description)) {
      alert("⚠️ Description is required");
      return;
    }

    if (isEmpty(this.createTask.groupName)) {
      alert("⚠️ Group Name is required");
      return;
    }

    if (!this.createTask.groupMembers || !this.createTask.groupMembers.length) {
      alert("⚠️ Please select at least one Group Member");
      return;
    }

    if (isEmpty(this.createTask.scheduleType)) {
      alert("⚠️ Schedule Type is required");
      return;
    }

    if (this.createTask.status === undefined || this.createTask.status === null) {
      alert("⚠️ Status is required");
      return;
    }

    if (isEmpty(this.createTask.fromDate)) {
      alert("⚠️ From Date is required");
      return;
    }

    if (isEmpty(this.createTask.toDate)) {
      alert("⚠️ To Date is required");
      return;
    }

    if (isEmpty(this.createTask.fromTime)) {
      alert("⚠️ From Time is required");
      return;
    }

    if (isEmpty(this.createTask.toTime)) {
      alert("⚠️ To Time is required");
      return;
    }

    // ❌ Stop if status is inactive
    if (!this.createTask.status) {
      alert("⚠️ Cannot create task while status is inactive. Enable the toggle to continue.");
      return;
    }
    // ✅ Prepare payload
    const payload = {
      ...this.createTask,
      status: this.createTask.status ? "Active" : "Inactive",
      fromDate: new Date(this.createTask.fromDate + 'T' + this.createTask.fromTime).toISOString(),
      toDate: new Date(this.createTask.toDate + 'T' + this.createTask.toTime).toISOString(),
    };

    // ✅ Call API
    this.peopleType.createNewtask(payload).subscribe({
      next: () => {
        alert("✅ Task Created Successfully");
        this.closeCreateTaskPopup();

        // Reset form
        this.createTask = {
          taskName: '',
          description: '',
          groupName: '',
          groupMembers: [],
          scheduleType: '',
          status: '',
          fromDate: '',
          toDate: '',
          fromTime: '',
          toTime: ''
        };
        this.groupMembersInput = '';

        this.tasks(); // refresh tasks list
      },
      error: (err) => {
        console.error("Error creating task:", err);
        alert("❌ Error creating task");
      }
    });
  }







  //task update




  onUpdateTaskGroupChange() {
    const selectedGroup = this.groupsList.find(
      g => g.groupName === this.updateTask.groupName
    );

    if (selectedGroup) {
      // ✅ Match the same behavior as onCreateTaskGroupChange
      this.selectedUpdateGroupMembers = selectedGroup.members || [];

      // ✅ Automatically select all members
      this.updateTask.groupMembers = [...selectedGroup.members];

      // ✅ Optional (if you use comma-separated display)
      this.updateTask.groupMembersInput = this.updateTask.groupMembers.join(', ');
    } else {
      this.selectedUpdateGroupMembers = [];
      this.updateTask.groupMembers = [];
      this.updateTask.groupMembersInput = '';
    }
  }



  // update task
  openUpdateTask = false;


  updateTask: any = {
    taskName: '',
    description: '',
    groupName: '',
    groupMembersInput: '',      // for comma-separated editing
    groupMembers: [] as string[],
    scheduleType: '',
    status: '',
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: ''
  };
  selectedTaskId: string = '';

  // open update popup
  openUpdateTaskPopup(task: any) {
    console.log("Update Task popup opened for:", task);
    this.selectedTaskId = task.id;

    this.updateTask = {
      taskName: task.taskName || '',
      description: task.description || '',
      groupName: task.groupName || '',
      groupMembers: task.groupMembers || [],
      scheduleType: task.scheduleType || '',
      status: task.status === "Active" ? true : false,  // fix for toggle boolean
      fromDate: task.fromDate ? task.fromDate.split('T')[0] : '',
      toDate: task.toDate ? task.toDate.split('T')[0] : '',
      fromTime: task.fromTime || '',
      toTime: task.toTime || '',
      groupMembersInput: (task.groupMembers || []).join(', ')
    };

    // 🟢 Call this manually so members update immediately
    this.onUpdateTaskGroupChange();

    this.openUpdateTask = true;
  }

  // close popup
  closeUpdateTaskPopup() {
    this.openUpdateTask = false;
  }

  // update task method
  updateTaskSubmit() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";

    // Convert input string → array (if you’re still using comma-separated input)
    this.updateTask.groupMembers = this.updateTask.groupMembersInput
      ? this.updateTask.groupMembersInput.split(',').map((x: string) => x.trim())
      : [];

    // ✅ Validate required fields
    if (isEmpty(this.updateTask.taskName)) missingFields.push("Task Name");
    if (isEmpty(this.updateTask.description)) missingFields.push("Description");
    if (isEmpty(this.updateTask.groupName)) missingFields.push("Group Name");
    if (!this.updateTask.groupMembers || !this.updateTask.groupMembers.length) missingFields.push("Group Members");
    if (isEmpty(this.updateTask.scheduleType)) missingFields.push("Schedule Type");
    if (this.updateTask.status === undefined || this.updateTask.status === null) missingFields.push("Status");
    if (isEmpty(this.updateTask.fromDate)) missingFields.push("From Date");
    if (isEmpty(this.updateTask.toDate)) missingFields.push("To Date");
    if (isEmpty(this.updateTask.fromTime)) missingFields.push("From Time");
    if (isEmpty(this.updateTask.toTime)) missingFields.push("To Time");

    // 🚫 Stop if missing fields
    if (missingFields.length) {
      alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
      return;
    }

    // 🚫 Stop if inactive
    if (!this.updateTask.status) {
      alert("⚠️ Cannot update task while status is inactive. Please enable the toggle to proceed.");
      return;
    }

    // ✅ Prepare payload
    const payload = {
      ...this.updateTask,
      status: this.updateTask.status ? "Active" : "Inactive",
      fromDate: new Date(this.updateTask.fromDate + 'T' + this.updateTask.fromTime).toISOString(),
      toDate: new Date(this.updateTask.toDate + 'T' + this.updateTask.toTime).toISOString(),
    };

    // ✅ Call API
    this.peopleType.updatetask(payload, this.selectedTaskId).subscribe({
      next: (res: any) => {
        alert(res.message || "✅ Task Updated Successfully");
        this.closeUpdateTaskPopup();

        // 🧹 Reset update form (like in createNewTask)
        this.updateTask = {
          taskName: '',
          description: '',
          groupName: '',
          groupMembers: [],
          scheduleType: '',
          status: '',
          fromDate: '',
          toDate: '',
          fromTime: '',
          toTime: '',
          groupMembersInput: ''
        };

        this.tasks(); // refresh list
      },
      error: (err) => {
        console.error("Error updating task:", err);
        alert("❌ Error updating task");
      }
    });
  }


  //delete task

  // Delete Task
  openDeleteTask = false;
  // selectedTaskId: string = '';

  // Open delete popup
  openDeleteTaskPopup(task: any) {
    this.selectedTaskId = task.id || task._id; // make sure your task object has an id
    if (!this.selectedTaskId) {
      alert("Task ID not found, cannot delete.");
      return;
    }
    this.openDeleteTask = true;
  }

  // Close delete popup
  closeDeleteTaskPopup() {
    this.openDeleteTask = false;
  }

  // Delete task method
  deleteTask() {
    this.peopleType.Deletetask(this.selectedTaskId).subscribe({
      next: (res: any) => {
        alert(res.message || 'Task deleted successfully');
        this.closeDeleteTaskPopup();
        this.tasks(); // reload task list
      },
      error: (err) => {
        console.error("Error deleting task:", err);
        alert("Error deleting task");
      }
    });
  }







  //manual attendance

  manualAttendanceList: any[] = [];
  filteredManualAttendanceList: any[] = [];
  manualAttendanceSearch: string = '';


  getManualAttendance(page: number = 1) {
    if (page < 1 || (this.totalPages && page > this.totalPages)) return;

    this.currentPage = page;
    this.peopleType.getManualAttendance(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        // ✅ Handle data safely
        this.manualAttendanceList = Array.isArray(res.data) ? res.data : [];
        this.filteredManualAttendanceList = [...this.manualAttendanceList];
        this.totalPages = res.totalPages || 1;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading manual attendance", err);
        this.manualAttendanceList = [];
        this.filteredManualAttendanceList = [];
      }
    });
  }


  onPageSizeChange(size: number) {
    this.pageSize = +size;
    this.currentPage = 1;
    this.getManualAttendance(this.currentPage);
    this.Access();
    this.loadPerson();
    this.Peopletype(1);
    this.groups();
    this.tasks();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.getManualAttendance(this.currentPage + 1);
    }

  }

  prevPage() {
    if (this.currentPage > 1) {
      this.getManualAttendance(this.currentPage - 1);
    }
  }

  nextPersonPage() {
    if (this.currentPage < this.totalPages) {
      this.loadPerson(this.currentPage + 1);
    }
  }

  prevPersonPage() {
    if (this.currentPage > 1) {
      this.loadPerson(this.currentPage - 1);
    }
  }





  searchManualAttendance() {
    const searchLower = this.manualAttendanceSearch.trim().toLowerCase();
    if (!searchLower) {
      this.filteredManualAttendanceList = [...this.manualAttendanceList];
      return;
    }
    this.filteredManualAttendanceList = this.manualAttendanceList.filter(record =>
      (record.personName && record.personName.toLowerCase().includes(searchLower)) ||
      (record.peopleType && record.peopleType.toLowerCase().includes(searchLower)) ||
      (record.status && record.status.toLowerCase().includes(searchLower)) ||
      (this.getPersonDisplay && this.getPersonDisplay(record.personId).toLowerCase().includes(searchLower))
      // Add more fields if you want
    );
  }






  // ✅ inside your component.ts

  // create manual attendance
  openCreateManualAttendance = false;

  createManualAttendance: any = {
    personId: '',
    personName: '',
    peopleType: '',
    fromDate: '',
    fromTime: '',
    status: false
  };

  // open popup
  openCreateManualAttendancePopup() {
    this.openCreateManualAttendance = true;
    // reset form
    this.createManualAttendance = {
      personId: '',
      personName: '',
      peopleType: '',
      fromDate: '',
      fromTime: '',
      status: false
    };
    // load people list when popup opens
    this.loadPerson();
  }

  // handle dropdown change
  onPersonSelect(event: any) {
    const selectedId = event.target.value;
    const selectedPerson = this.personList.find(p => p.id == selectedId);

    if (selectedPerson) {
      this.createManualAttendance.personId = selectedPerson.id; // ✅ internal ID
      this.createManualAttendance.personName = `${selectedPerson.firstName} ${selectedPerson.lastName}`;
      this.createManualAttendance.peopleType = selectedPerson.peopleType;
    }
  }





  // close popup
  closeCreateManualAttendancePopup() {
    this.openCreateManualAttendance = false;
  }

  // create new manual attendance
  createNewManualAttendance() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";

    // 🔹 One-by-one validation
    // if (isEmpty(this.createManualAttendance.personId)) {
    //   alert("⚠️ Person ID is required");
    //   return;
    // }

    // if (isEmpty(this.createManualAttendance.personName)) {
    //   alert("⚠️ Person Name is required");
    //   return;
    // }

    if (isEmpty(this.createManualAttendance.peopleType)) {
      alert("⚠️ Members is required");
      return;
    }

    if (isEmpty(this.createManualAttendance.fromDate)) {
      alert("⚠️ From Date is required");
      return;
    }

    if (isEmpty(this.createManualAttendance.fromTime)) {
      alert("⚠️ From Time is required");
      return;
    }

    if (
      this.createManualAttendance.status === undefined ||
      this.createManualAttendance.status === null
    ) {
      alert("⚠️ Status is required");
      return;
    }

    // ❌ Stop if status toggle is OFF
    if (!this.createManualAttendance.status) {
      alert("⚠️ Cannot create manual attendance while status is Inactive. Please enable the toggle to proceed.");
      return;
    }

    // ✅ Prepare payload
    const payload = {
      personId: this.createManualAttendance.personId,
      personName: this.createManualAttendance.personName,
      peopleType: this.createManualAttendance.peopleType,
      fromDate: new Date(this.createManualAttendance.fromDate).toISOString().split("T")[0], // only YYYY-MM-DD
      fromTime: this.createManualAttendance.fromTime,
      status: this.createManualAttendance.status ? "Active" : "Inactive"
    };

    // ✅ Call API
    this.peopleType.createmanualAttendance(payload).subscribe({
      next: () => {
        alert("✅ Manual Attendance Created Successfully");
        this.closeCreateManualAttendancePopup();
        this.getManualAttendance(); // refresh table
      },
      error: (err) => {
        console.error("Error creating manual attendance:", err);
        alert("❌ Error while creating manual attendance");
      }
    });
  }


  //edit attendance
  openEditManualAttendance = false;

  editManualAttendance: any = {
    id: '',
    personId: '',          // BSON id
    displayPersonId: '',   // for showing idNumber
    personName: '',        // first + last name
    peopleType: '',
    fromDate: '',
    fromTime: '',
    status: true
  };

  openEditManualAttendancePopup(record: any) {
    this.openEditManualAttendance = true;

    const selectedPerson = this.personList.find(p => p.id == record.personId);

    // Format date as YYYY-MM-DD for input[type="date"]
    let formattedDate = '';
    if (record.fromDate) {
      const d = new Date(record.fromDate);
      formattedDate = d.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    this.editManualAttendance = {
      id: record.id,
      personId: record.personId,
      displayPersonId: selectedPerson ? selectedPerson.idNumber : '',
      personName: selectedPerson
        ? `${selectedPerson.firstName} ${selectedPerson.lastName}`
        : record.personName,
      peopleType: record.peopleType,
      fromDate: formattedDate,   // ✅ use formatted date
      fromTime: record.fromTime,
      status: record.status
    };
  }


  onEditPersonSelect(event: any) {
    const selectedId = event.target.value;
    const selectedPerson = this.personList.find(p => p.id == selectedId);
    if (selectedPerson) {
      this.editManualAttendance.personId = selectedPerson.id; // BSON id for backend
      this.editManualAttendance.displayPersonId = selectedPerson.idNumber; // for showing idNumber
      this.editManualAttendance.personName = `${selectedPerson.firstName} ${selectedPerson.lastName}`;

      // ✅ Auto-fill peopleType from selected person
      this.editManualAttendance.peopleType = selectedPerson.peopleType;
    }
  }

  closeEditManualAttendancePopup() {
    this.openEditManualAttendance = false;
  }

  updateManualAttendance() {
    const missingFields: string[] = [];
    const isEmpty = (val: any) => val === undefined || val === null || val.toString().trim() === "";

    // ✅ Validate required fields individually
    if (isEmpty(this.editManualAttendance.personId)) missingFields.push("Person ID");
    if (isEmpty(this.editManualAttendance.personName)) missingFields.push("Person Name");
    if (isEmpty(this.editManualAttendance.peopleType)) missingFields.push("People Type");
    if (isEmpty(this.editManualAttendance.fromDate)) missingFields.push("From Date");
    if (isEmpty(this.editManualAttendance.fromTime)) missingFields.push("From Time");
    if (this.editManualAttendance.status === undefined || this.editManualAttendance.status === null) missingFields.push("Status");

    // Stop if any required field is missing
    if (missingFields.length) {
      alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
      return;
    }

    // 🚫 Stop update if status is Inactive
    if (!this.editManualAttendance.status) {
      alert("⚠️ Cannot update manual attendance while status is Inactive. Please enable the toggle to proceed.");
      return;
    }

    // ✅ Prepare payload
    const fromDate = new Date(this.editManualAttendance.fromDate);
    const payload = {
      personId: this.editManualAttendance.personId,
      personName: this.editManualAttendance.personName,
      peopleType: this.editManualAttendance.peopleType,
      fromDate: fromDate.toISOString().split("T")[0], // only YYYY-MM-DD
      fromTime: this.editManualAttendance.fromTime,
      status: this.editManualAttendance.status ? "Active" : "Inactive"
    };

    // ✅ Call API
    this.peopleType.updateAttendance(payload, this.editManualAttendance.id).subscribe({
      next: () => {
        alert("✅ Manual Attendance Updated Successfully");
        this.closeEditManualAttendancePopup();
        this.getManualAttendance(); // refresh table
      },
      error: (err: any) => {
        console.error("Error updating manual attendance:", err);
        alert("❌ Error while updating manual attendance");
      }
    });
  }




  // delete attendance

  openDeleteManualAttendance = false;
  deleteManualAttendanceId: string = "";

  openDeleteManualAttendancePopup(record: any) {
    this.openDeleteManualAttendance = true;
    this.deleteManualAttendanceId = record.id; // make sure record has id
  }

  closeDeleteManualAttendancePopup() {
    this.openDeleteManualAttendance = false;
    this.deleteManualAttendanceId = "";
  }

  deleteManualAttendance() {
    if (!this.deleteManualAttendanceId) return;

    this.peopleType.DeleteAttendance(this.deleteManualAttendanceId).subscribe({
      next: () => {
        alert("Manual Attendance Deleted Successfully");
        this.closeDeleteManualAttendancePopup();
        this.getManualAttendance(); // refresh list
      },
      error: (err: any) => {
        console.error("Error deleting manual attendance:", err);
        alert("Error while deleting manual attendance");
      }
    });
  }











  selectedPerson: any = null;

  // This method is called when dropdown changes
  onPersonIdChange(event: any) {
    const selectedId = event.target.value;

    // Find the person matching the selected ID
    this.selectedPerson = this.personList.find((p: any) => p.idNumber === selectedId);

    if (this.selectedPerson) {
      // Fill the fields automatically
      this.createManualAttendance.personName =
        this.selectedPerson.firstName + ' ' + this.selectedPerson.lastName;

      this.createManualAttendance.peopleType = this.selectedPerson.peopleType;
    } else {
      // Clear the fields if no selection
      this.createManualAttendance.personName = '';
      this.createManualAttendance.peopleType = '';
    }
  }






  today: string = new Date().toISOString().split('T')[0];





}




