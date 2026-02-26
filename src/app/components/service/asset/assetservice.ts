import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Assetservice {

    constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl;


// assetservice.ts
getAllAssets() {
  return this.http.get(`${this.baseUrl}Asset/all`);
}





createAsset(payload: any) {
  return this.http.post(`${this.baseUrl}Asset/create`, payload);
}





updateAsset(id: string, payload: any) {
  return this.http.put(`${this.baseUrl}Asset/update/${id}`, payload);
}


  






  deleteAsset(id: any) {
    return this.http.delete(`${this.baseUrl}Asset/delete/${id}`)
  }
}

