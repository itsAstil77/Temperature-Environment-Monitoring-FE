import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Reportservice } from '../../service/reports/reportservice';
import { FormsModule } from '@angular/forms';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';






@Component({
  selector: 'app-viewreport',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './viewreport.html',
  styleUrl: './viewreport.css'
})
export class Viewreport implements OnInit {
  

  report: any;

  reportId: any;
  noData = false;
  // reportData: any;

  constructor(private route: ActivatedRoute, private api: Reportservice, private cdr: ChangeDetectorRef) { }

reportData: any = {}; 
visits: any[] = [];
startTime: string = "";
endTime: string = "";
reportName: string = "";
page: number = 1;
pageSize: number = 15;  // default
totalRecords: number = 0;

// ── Temperature report specific ──────────────────────────────────────────
  isTemperatureReport: boolean = false;
  temperatureRecords: any[] = [];
  tempFromDate: string = '';
  tempToDate: string = '';
  tempLoading: boolean = false;
  tempError: string = '';
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const reportType = this.route.snapshot.queryParamMap.get('type');

    if (reportType === 'temperature') {
      // ── Temperature report flow ──────────────────────────────────────────
      this.isTemperatureReport = true;
      this.tempFromDate = this.route.snapshot.queryParamMap.get('fromDate') || '';
      this.tempToDate   = this.route.snapshot.queryParamMap.get('toDate')   || '';

      // Try to get data from router state first (passed from reports page)
      const navState = history.state?.temperatureData;
      if (navState && Array.isArray(navState) && navState.length > 0) {
        this.temperatureRecords = navState;
        this.totalRecords = navState.length;
        this.cdr.detectChanges();
      } else {
        // Fallback: re-fetch if state is missing (e.g. page refresh)
        this.loadTemperatureReport();
      }
    } else {
      // ── Existing asset report flow ───────────────────────────────────────
      this.isTemperatureReport = false;
      this.reportId = this.route.snapshot.paramMap.get("id")!;
      console.log("📄 Viewing report ID:", this.reportId);

      this.api.getReportByID(this.reportId, 1, 1).subscribe({
        next: (res: any) => {
          this.reportData = res.report;
          this.cdr.detectChanges();
          this.loadAssetLiveSummary();
        },
        error: err => {
          console.error("❌ Error loading report:", err);
          alert("Report not found.");
        }
      });
    }
  }

  // ── Temperature report loader (fallback on refresh) ──────────────────────
  loadTemperatureReport(): void {
    this.tempLoading = true;
    this.tempError   = '';

    const fromISO = `${this.tempFromDate}T00:00:00.000Z`;
    const toISO   = `${this.tempToDate}T23:59:59.999Z`;

    this.api.getTemperatureReport(fromISO, toISO).subscribe({
      next: (res: any) => {
        this.temperatureRecords = Array.isArray(res) ? res : [];
        this.totalRecords       = this.temperatureRecords.length;
        this.tempLoading        = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.tempError   = 'Failed to load temperature report.';
        this.tempLoading = false;
        console.error('Temperature report error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Paginated temperature records ────────────────────────────────────────
  get paginatedTempRecords(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.temperatureRecords.slice(start, start + this.pageSize);
  }

  // ── Existing asset report methods ────────────────────────────────────────
  loadGeneratedReport() {
    this.api.getGenerateReport(this.startTime, this.endTime, this.reportName).subscribe({
      next: (res: any) => { this.reportData = res.report; this.cdr.detectChanges(); },
      error: err => { console.error(err); alert("Failed to generate report"); }
    });
  }

  loadReport() {
    this.api.getReportByID(this.reportId, this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.reportData   = res.report;
        this.visits       = res.visits || [];
        this.totalRecords = res.totalRecords || this.reportData.totalVisits || 0;
        this.cdr.detectChanges();
      },
      error: err => { console.error(err); alert("Failed to load report."); }
    });
  }

  changePageSize() {
    this.page = 1;
    this.isTemperatureReport ? this.cdr.detectChanges() : this.loadAssetLiveSummary();
  }

  nextPage() {
    if ((this.page * this.pageSize) < this.totalRecords) {
      this.page++;
      this.isTemperatureReport ? this.cdr.detectChanges() : this.loadAssetLiveSummary();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.isTemperatureReport ? this.cdr.detectChanges() : this.loadAssetLiveSummary();
    }
  }

  async loadAll() {
    try {
      const res: any = await this.api.getAssetLiveSummary(this.reportId, 1, 1000000).toPromise();
      this.visits = Array.isArray(res) ? res : (res.assets || res.data || res.results || []);
      console.log("📥 Downloaded all assets:", this.visits.length);
    } catch (error) {
      console.error("❌ Error loading all assets:", error);
      throw error;
    }
  }

  async onDownloadClick() {
    if (this.isTemperatureReport) {
      this.downloadTemperatureExcel();
      return;
    }
    await this.loadAll();
    const wb   = XLSX.utils.book_new();
    const wsData: any[][] = [
      [`Report Name: ${this.reportData.reportName}`],
      [`Start Time: ${new Date(this.reportData.startTime).toLocaleString()}`],
      [`End Time: ${new Date(this.reportData.endTime).toLocaleString()}`],
      [`Total Assets: ${this.visits.length}`],
      [],
      ["S.No", "Asset Name", "Unique ID", "Project", "Department", "Category", "Brand", "Model", "Status", "Check-In Time", "Check-Out Time"]
    ];
    this.visits.forEach((v: any, i: number) => {
      wsData.push([
        i + 1,
        v.assetName || '—', v.uniqueId || '—', v.projectName || '—',
        v.department || '—', v.mainCategory || '—', v.brand || '—',
        v.model || '—', v.status || '—',
        v.checkInTime  ? new Date(v.checkInTime).toLocaleString()  : '—',
        v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '—'
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
    XLSX.utils.book_append_sheet(wb, ws, 'Asset Report');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${this.reportData.reportName}.xlsx`);
  }

  downloadTemperatureExcel() {
    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [
      [`Temperature Report`],
      [`From: ${this.tempFromDate}   To: ${this.tempToDate}`],
      [`Total Records: ${this.temperatureRecords.length}`],
      [],
      ["S.No", "MAC Address", "Serial Number", "Last Temperature (°C)", "Last Date & Time"]
    ];
    this.temperatureRecords.forEach((r: any, i: number) => {
      wsData.push([
        i + 1,
        r.macAddress    || '—',
        r.serialNumber  || '—',
        r.lastTemperature ?? '—',
        r.lastDateTime ? new Date(r.lastDateTime).toLocaleString() : '—'
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    XLSX.utils.book_append_sheet(wb, ws, 'Temperature Report');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Temperature_Report_${this.tempFromDate}_${this.tempToDate}.xlsx`);
  }

  loadAssetLiveSummary() {
    this.api.getAssetLiveSummary(this.reportId, this.page, this.pageSize).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.visits       = res;
          this.totalRecords = res.length;
        } else {
          this.visits       = res.assets || res.data || res.results || [];
          this.totalRecords = res.totalRecords || res.total || this.visits.length;
        }
        this.cdr.detectChanges();
      },
      error: err => { console.error("❌ Asset Summary Error:", err); alert("Failed to load asset summary."); }
    });
  }
}
