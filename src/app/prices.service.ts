import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PricesService {
  private baseUrl = environment.backendBaseUrl;
  private pricesUrl = environment.endpoints.prices;
  constructor(private _http: HttpClient) { }

  getCurrentPrices(): Observable<any> {
    return this._http
      .get(this.baseUrl + this.pricesUrl);
  }
}
