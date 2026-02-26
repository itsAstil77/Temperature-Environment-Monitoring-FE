import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, ChartType } from 'chart.js';
import { Dashboardchart } from '../../../service/dashboardchart/dashboardchart';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Peopletype } from '../../../service/peopletype/peopletype';

Chart.register(...registerables);

interface ChartModel {
  name: string;
  type: ChartType;
  icon: SafeHtml;
}

@Component({
  selector: 'app-personaldashboard',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './personaldashboard.html',
  styleUrl: './personaldashboard.css'
})

export class Personaldashboard implements OnInit, AfterViewInit {

  constructor(private dashboardchaet: Dashboardchart, private sanitizer: DomSanitizer, private peopletypeService: Peopletype,private cdr: ChangeDetectorRef) {}

liveTemperature: number = 30;
  chart: any;
  selectedRange: string = 'hour';
  activeTab: string = 'dashboard';
  selectedCategory: string = 'day';
  selectedOption: string = '24';
  selectedMac: string = '';
  subOptions: any[] = [];
  models: ChartModel[] = [];
  selectedModel: ChartModel = { name: 'Line', type: 'line' as ChartType, icon: '' };
  devices: { uniqueId: string; [key: string]: any }[] = [];
  devicesLoading: boolean = true;

  ngOnInit() {
    this.models = [
      {
        name: 'Line',
        type: 'line' as ChartType,
        icon: this.sanitizer.bypassSecurityTrustHtml(`
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <polyline points="2,18 8,10 13,14 22,4"/>
          </svg>`)
      },
      {
        name: 'Bar',
        type: 'bar' as ChartType,
        icon: this.sanitizer.bypassSecurityTrustHtml(`
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <rect x="2" y="10" width="4" height="12"/>
            <rect x="10" y="6" width="4" height="16"/>
            <rect x="18" y="2" width="4" height="20"/>
          </svg>`)
      },
      {
        name: 'Pie',
        type: 'pie' as ChartType,
        icon: this.sanitizer.bypassSecurityTrustHtml(`
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M12 2a10 10 0 0 1 10 10H12V2z" opacity="0.6"/>
            <path d="M12 12L4.93 19.07A10 10 0 0 1 12 2v10z" opacity="0.8"/>
            <path d="M12 12v10a10 10 0 0 1-7.07-2.93L12 12z"/>
          </svg>`)
      }
    ];

    this.selectedModel = this.models[0];

    
    setInterval(() => {
      this.liveTemperature = Math.floor(Math.random() * 5) + 28;
    }, 2000);
  }


  loadDevices() {
    this.devicesLoading = true;
    this.peopletypeService.getaddDevices().subscribe({
      next: (res: any) => {
        this.devices = Array.isArray(res) ? res : (res.data ?? []);
        if (this.devices.length > 0) {
          this.selectedMac = this.devices[0].uniqueId; 
          this.loadData();
        }
        this.devicesLoading = false;
             this.cdr.detectChanges();  
      },
      error: (err) => {
        console.error('Failed to load devices:', err);
        this.devicesLoading = false;
      }
    });
  }
  

ngAfterViewInit(): void {
  setTimeout(() => {
    this.onCategoryChange();
    this.createChart();
    this.loadDevices();
        this.cdr.detectChanges();
  }, 0);
}



setTab(tab: string) {
  this.activeTab = tab;
  if (tab === 'dashboard') {
    setTimeout(() => {
      this.createChart();
      this.loadData();        // ← reload data when switching back to dashboard tab
    }, 100);                  // ← same 100ms to wait for *ngIf to re-render canvas
  }
}
  createChart() {
    if (!this.selectedModel || !this.selectedModel.type) return;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart("temperatureChart", {
      type: this.selectedModel.type as ChartType,
      data: {
        labels: [],
        datasets: [
          {
            label: 'Temperature (°C)',
            data: [],
            backgroundColor: [
              'rgba(105, 12, 134, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)'
            ],
            borderColor: 'blue',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    this.loadData();
  }

  selectModel(model: any) {
    this.selectedModel = model;
    this.createChart();
  }

  onRangeChange() {
    this.loadData();
  }

  loadData() {
    if (!this.selectedOption || !this.selectedMac) return;

    const value = Number(this.selectedOption);

    if (this.selectedCategory === 'day') {
      this.dashboardchaet.getTemperatureByHours(value, this.selectedMac).subscribe({
        next: (res: any) => this.updateChart(res),
        error: (err) => console.error(err)
      });
    } else {
      this.dashboardchaet.getTemperatureByDays(value, this.selectedMac).subscribe({
        next: (res: any) => this.updateChart(res),
        error: (err) => console.error(err)
      });
    }
  }

  // updateChart(res: any) {
  //   console.log("API Response:", res);
  //   if (!this.chart) return;

  //   const labels = res.map((item: any) => {
  //     const date = new Date(item.time);
  //     return date.toLocaleTimeString();
  //   });

  //   const data = res.map((item: any) => item.temperature);

  //   this.chart.data.labels = labels;
  //   this.chart.data.datasets[0].data = data;
  //   this.chart.update();
  // }



  updateChart(res: any) {
  console.log("API Response:", res);
  if (!this.chart) return;

  const labels = res.map((item: any) => {
    const utcDate = new Date(item.time);

    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dubai',  // ← correct UTC+4, no IST interference
      hour:     '2-digit',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   true
    }).format(utcDate);
  });

  const data = res.map((item: any) => item.temperature);

  this.chart.data.labels                = labels;
  this.chart.data.datasets[0].data      = data;
  this.chart.update();
}



onCategoryChange(triggerLoad: boolean = false) {
  if (this.selectedCategory === 'day') {
    this.subOptions = [
      { label: '1 Hour', value: '1' },
      { label: '2 Hour', value: '2' },
      { label: '8 Hour', value: '8' },
      { label: '24 Hour', value: '24' }
    ];
    this.selectedOption = '24';
  }

  if (this.selectedCategory === 'week') {
    this.subOptions = [
      { label: '1 Day', value: '1' },
      { label: '2 Day', value: '2' },
      { label: '5 Day', value: '5' },
      { label: '7 Day', value: '7' }
    ];
    this.selectedOption = '7';
  }

  if (this.selectedCategory === 'month') {
    this.subOptions = [
      { label: '8 Day', value: '8' },
      { label: '15 Day', value: '15' },
      { label: '25 Day', value: '25' },
      { label: '30 Day', value: '30' }
    ];
    this.selectedOption = '30';
  }
    this.cdr.detectChanges();

  if (triggerLoad) {
    this.loadData();   // only called when user manually changes the dropdown
  }
}




}