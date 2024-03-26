import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";

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

  getAllFromWishlistDB():Observable<any>{
    const stockData = {
      "stocks": [
        {
          "ticker": "GOOGL",
          "companyName": "Alphabet Inc",
          "currentPrice": 140.52,
          "change": {
            "amount": 2.25,
            "percentage": 1.58
          }
        },
        {
          "ticker": "MSFT",
          "companyName": "Microsoft Corp",
          "currentPrice": 404.06,
          "change": {
            "amount": -2.50,
            "percentage": -0.61
          }
        }
      ]
    };
    return of(stockData);
  }


}



