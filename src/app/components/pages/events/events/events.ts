import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../../service/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events',
  imports: [CommonModule,FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  activeTab: string = 'people';

  eventsList: any[] = []; // only deviceId + description

  constructor(private user: User, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  // loadEvents() {
  //   this.user.loadevent().subscribe({
  //     next: (res: any) => {
  //       this.eventsList = res
  //       this.cdr.detectChanges();

  //     },
  //     error: (err) => console.error('Error loading events', err)
  //   });
  // }


  currentPage: number = 1;    // dynamic current page
  pageSize: number = 10;       // dynamic page size
  pageSizes: number[] = [5, 10, 20, 50]; // user can choose
  totalPages: number = 0;


loadEvents(page: number = this.currentPage) {
  this.user.loadevent(page, this.pageSize).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.eventsList = res.data;
        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.cdr.detectChanges();
      }
    },
    error: (err) => console.error('Error loading events', err)
  });
}
onPageSizeChange(size: number) {
  this.pageSize = size;
  this.loadEvents(1); // reload first page with new size
}




  setActive(tab: string) {
    this.activeTab = tab;
  }

}





