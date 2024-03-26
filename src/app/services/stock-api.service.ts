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

  getLatestStockPrice(stockTicker: any) {
    return this.http.get("http://localhost:3000/latestPrice/" + stockTicker);
  }

  getAllFromWishlistDB(): Observable<any> {
    return this.http.get("http://localhost:3000/getAllStocks");
  }

  postIntoWishListData() {
    let stockData1 = {
      "ticker": "TSLA",
      "companyName": "TSLA Corp",
      "currentPrice": 404.06,
      "change": {
        "amount": -2.50,
        "percentage": -0.61
      }
    }
    return this.http.post("http://localhost:3000/insertWishlist", stockData1);
  }

  deleteFromWishlistDB(stockTicker: any){
    console.log("Delete api in service");
    console.log(stockTicker);
    return this.http.get("http://localhost:3000/deleteStockFromWishlist/" + stockTicker);
  }
}



