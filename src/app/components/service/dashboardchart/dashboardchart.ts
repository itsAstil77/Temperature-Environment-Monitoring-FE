import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';


@Injectable({
  providedIn: 'root',
})
export class Dashboardchart {

   constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl;



getTemperatureByDays(days: number, mac: string) {
  return this.http.get(
    `${this.baseUrl}Temperature/graph/days?days=${days}&macAddress=${mac}`
  );
}

getTemperatureByHours(hours: number, mac: string) {
  return this.http.get(
    `${this.baseUrl}Temperature/graph/hours?hours=${hours}&macAddress=${mac}`
  );
}

  
}
