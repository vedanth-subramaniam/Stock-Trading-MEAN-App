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

  getTickerWishListDB(stockTicker: any){
    return this.http.get("http://localhost:3000/getStock/" + stockTicker);
  }
  postIntoWishListData(stockData:any) {
    return this.http.post("http://localhost:3000/insertStockWishlist", stockData);
  }

  deleteFromWishlistDB(stockTicker: any) {
    console.log("Delete api in service");
    console.log(stockTicker);
    return this.http.get("http://localhost:3000/deleteStockFromWishlist/" + stockTicker);
  }

  getPortfolioData(): Observable<any> {
    console.log("Get All from the Portfolio");
    return this.http.get("http://localhost:3000/getAllPortfolioData");
  }

  postIntoPortfolioData() {
    let portfolioData = {
      "ticker": "AAPL",
      "companyName": "Apple Inc",
      "quantity": 5,
      "avgCostPerShare": 184.37,
      "totalCost": 921.85,
      "change": 0,
      "currentPrice": 184.37,
      "marketValue": 921.85
    }
    return this.http.post("http://localhost:3000/insertWishlist", portfolioData);
  }

  deleteFromPortfolioDB(stockTicker: any) {
    console.log("Delete Portfolio in service");
    return this.http.get("http://localhost:3000/deleteFromPortfolio/" + stockTicker);
  }

  getSingleRecordPortfolioDB(stockTicker: any) {
    console.log("fetching portfolio records for single record");
    return this.http.get("http://localhost:3000/getPortfolioData/" + stockTicker);
  }

  getWalletBalanceDB() {
    return this.http.get("http://localhost:3000/wallet");
  }

  updateWalletBalanceDB(balance: any) {
    let walletBalance = {
      "balance": balance
    }
    return this.http.post("http://localhost:3000/updateWalletBalance", walletBalance);
  }
}



