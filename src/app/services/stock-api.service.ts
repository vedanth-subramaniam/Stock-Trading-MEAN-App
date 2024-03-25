import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StockApiService {

  constructor(private http: HttpClient) {
  }

  getAutocompleteAPI(stockVal: any) {
    return this.http.get("http://localhost:3000/autoComplete/" + stockVal);
  }

  getCompanyCommonDetailsAPI(stockTicker: any) {
    return this.http.get("http://localhost:3000/search/" + stockTicker);
  }

  getChartsHourlyDetailsAPI(stockTicker: any) {
    return this.http.get("http://localhost:3000/chartsHourly/" + stockTicker);
  }
  getNewsTabDetailsAPI(stockTicker: any) {
    return this.http.get("http://localhost:3000/news/" + stockTicker);
  }

  getChartsTabDetailsAPI(stockTicker: any) {
    return this.http.get("http://localhost:3000/charts/" + stockTicker);
  }

  getInsightsTabDetailsAPI(stockTicker: any) {
    return this.http.get("http://localhost:3000/insights/" + stockTicker)
  }
}
