import {Component, OnInit} from '@angular/core';
import {StockApiService} from "../../services/stock-api.service";
import {CurrencyPipe, DecimalPipe, NgClass, NgForOf} from "@angular/common";
import {computeStartOfLinePositions} from "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file";
import {response} from "express";

@Component({
  selector: 'app-stock-wishlist',
  standalone: true,
  imports: [
    NgClass,
    CurrencyPipe,
    DecimalPipe,
    NgForOf
  ],
  templateUrl: './stock-wishlist.component.html',
  styleUrl: './stock-wishlist.component.css'
})
export class StockWishlistComponent implements OnInit {
  stocks: Stock[] = [];

  constructor(private stockService: StockApiService) {
  }

  ngOnInit() {
    this.stockService.getAllFromWishlistDB().subscribe(data => {
      console.log(data);
      this.stocks = data;
      console.log(this.stocks);
      for (let stock of this.stocks) {
        this.stockService.getLatestStockPrice(stock.ticker).subscribe({
          next: (response: any) => {
            let stockLatestPrice = response;
            stock.currentPrice = stockLatestPrice.c;
            stock.change.amount = stockLatestPrice.d;
            stock.change.percentage = stockLatestPrice.dp;
            console.log("Stock from API values", stock);
          }
        });
        // Update the price for all
        console.log(stock);
      }
    });
  }

  deleteStock(id: any, ticker: any, index: any) {
    console.log("delete api")
    this.stocks.splice(index, 1);
    this.stockService.deleteFromWishlistDB(ticker).subscribe({
      next: (response) => {
        console.log("Delete successful");
        console.log(response);
      }
    });
  }
}

export interface Stock {
  _id: any
  ticker: string;
  companyName: string;
  currentPrice: number;
  change: {
    amount: number;
    percentage: number;
  };
}
