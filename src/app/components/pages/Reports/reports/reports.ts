import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { Reportservice } from '../../../service/reports/reportservice';

@Component({
  selector: 'app-reports',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  activeTab: string = 'project'; // 👈 default tab
  selectedTimeRange: string = 'day';


  constructor(private role: Roleservice, private cdr: ChangeDetectorRef, private api: Reportservice, private router: Router) { }

  ngOnInit(): void {
    // this.selectedTimeRange = 'day';
    
    this.loadProject();

  }

  // ... rest of your code unchanged ...



  // ── Project ───────────────────────────────────────────────────────────────
  projects: any[] = [];

  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => { this.projects = res; this.cdr.detectChanges(); },
      error: () => console.log("error loading project")
    });
  }

  // ── Country ───────────────────────────────────────────────────────────────
  countriesByProject: { [projectId: string]: any[] } = {};
  expandedProjects: Set<string> = new Set();

  toggleProject(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
    } else {
      this.expandedProjects.add(projectId);
      this.loadCountries(projectId);
    }
  }

  loadCountries(projectId: string) {
    if (this.expandedProjects.has(projectId)) { this.expandedProjects.delete(projectId); return; }
    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
        this.expandedProjects.add(projectId);
        this.cdr.detectChanges();
      },
      error: () => console.log("Error loading countries")
    });
  }

  // ── Area ──────────────────────────────────────────────────────────────────
  areaByCountry: { [countryId: string]: any[] } = {};
  expandedCountry: Set<string> = new Set();

  toggleCountry(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
    } else {
      this.expandedCountry.add(countryId);
      this.loadArea(countryId);
    }
  }

  loadArea(countryId: string) {
    if (this.expandedCountry.has(countryId)) { this.expandedCountry.delete(countryId); return; }
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          this.cdr.detectChanges();
        },
        error: () => console.log("Error loading areas")
      });
    } else {
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();
    }
  }

  // ── Building ──────────────────────────────────────────────────────────────
  buildingByArea: { [areaId: string]: any[] } = {};
  expandedArea: Set<string> = new Set();

  toggleArea(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
    } else {
      this.expandedArea.add(areaId);
      this.loadBuilding(areaId);
    }
  }

  loadBuilding(areaId: string) {
    if (this.expandedArea.has(areaId)) { this.expandedArea.delete(areaId); return; }
    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        this.cdr.detectChanges();
      },
      error: () => console.log("Error loading building")
    });
  }

  // ── Floor ─────────────────────────────────────────────────────────────────
  floors: any[] = [];
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();

  toggleBuilding(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
    } else {
      this.expandedBuilding.add(buildingId);
      this.loadFloor(buildingId);
    }
  }

  loadFloor(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) { this.expandedBuilding.delete(buildingId); return; }
    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        this.floors = res;
        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();
      },
      error: () => console.log("Error loading floor")
    });
  }

  // ── Zone ──────────────────────────────────────────────────────────────────
  zones: any[] = [];
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();

  toggleFloor(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
    } else {
      this.expandedFloor.add(floorId);
      this.loadZones(floorId);
    }
  }

  loadZones(floorId: string) {
    if (this.expandedFloor.has(floorId)) { this.expandedFloor.delete(floorId); return; }
    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        this.zones = res;
        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();
      },
      error: () => console.log("Error loading zones")
    });
  }

  // ── SubZone ───────────────────────────────────────────────────────────────
  subZones: any[] = [];
  subZoneByZone: { [zoneId: string]: any[] } = {};
  expandedZone: Set<string> = new Set();

  toggleZone(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
    } else {
      this.expandedZone.add(zoneId);
      this.loadSubZones(zoneId);
    }
  }

  loadSubZones(zoneId: string) {
    if (this.expandedZone.has(zoneId)) { this.expandedZone.delete(zoneId); return; }
    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        this.subZones = res;
        this.subZoneByZone[zoneId] = Array.isArray(res) ? res : [];
        this.expandedZone.add(zoneId);
        this.cdr.detectChanges();
      },
      error: () => console.error("Error loading subzones")
    });
  }

  // ── Selection ─────────────────────────────────────────────────────────────
  selectedItemId: string | number | null = null;
  selectedZoneName: string | null = null;

  selectItem(id: string | number) { this.selectedItemId = id; }

  selectZone(zone: any) {
    this.selectedItemId  = zone.id;
    this.selectedZoneName = zone.zoneName;
  }

  private saveReport(reportDetails: any) {
    const existingReports = JSON.parse(localStorage.getItem('reports') || '[]');
    existingReports.push(reportDetails);
    localStorage.setItem('reports', JSON.stringify(existingReports));
  }

  getHoursFromSelection(selectedHour: string): number {
    if (!selectedHour) return 0;
    const value = selectedHour.toLowerCase().trim();
    if (value === 'live') return 0;
    if (value.includes('hour')) { const h = parseInt(value, 10); return isNaN(h) ? 0 : h; }
    return 0;
  }

  getDaysFromSelection(selection: string): number {
    if (!selection) return 0;
    if (selection.includes('Day'))  return parseInt(selection);
    if (selection.includes('Week')) return parseInt(selection) * 7;
    return 0;
  }

  // today's date string for [max] binding  e.g. "2026-02-25"
  today: string = new Date().toISOString().split('T')[0];

  dailyTime: string = "";
  isDailyTimeFocused: boolean = false;
  weeklyDay: string = '';
  weeklyTime: string = '';
  isWeeklyDayFocused: boolean = false;
  isWeeklyTimeFocused: boolean = false;
  monthlyDay: number | null = null;
  monthlyTime: string = "";
  isMonthlyDateFocused: boolean = false;
  isMonthlyTimeFocused: boolean = false;

  getFormattedDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // ── Temperature Report ────────────────────────────────────────────────────
  tempFromDate: string = '';       // "YYYY-MM-DD"
  tempToDate: string   = '';       // "YYYY-MM-DD"
  tempReportLoading: boolean = false;
  tempDateError: string = '';

  generateTemperatureReport(): void {
    this.tempDateError = '';

    // Validation
    if (!this.tempFromDate || !this.tempToDate) {
      this.tempDateError = 'Please select both From Date and To Date.';
      return;
    }
    if (this.tempFromDate > this.tempToDate) {
      this.tempDateError = 'From Date cannot be greater than To Date.';
      return;
    }

    this.tempReportLoading = true;

    // Append T00:00:00.000Z (start of day) for fromDate
    // Append T23:59:59.999Z (end of day)   for toDate
    const fromISO = `${this.tempFromDate}T00:00:00.000Z`;
    const toISO   = `${this.tempToDate}T23:59:59.999Z`;

    this.api.getTemperatureReport(fromISO, toISO).subscribe({
      next: (res: any) => {
        this.tempReportLoading = false;
        // Navigate to /viewreport with query params — data carried as JSON in state
        this.router.navigate(['/viewreport'], {
          queryParams: {
            type: 'temperature',
            fromDate: this.tempFromDate,
            toDate: this.tempToDate
          },
          state: { temperatureData: res }
        });
      },
      error: (err: any) => {
        this.tempReportLoading = false;
        this.tempDateError = 'Failed to fetch temperature report. Please try again.';
        console.error('Temperature report error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  clearTemperatureReport(): void {
    this.tempFromDate    = '';
    this.tempToDate      = '';
    this.tempDateError   = '';
    this.tempReportLoading = false;
  }
  // ─────────────────────────────────────────────────────────────────────────
}
