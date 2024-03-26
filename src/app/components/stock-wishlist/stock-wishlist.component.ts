import {Component, OnInit} from '@angular/core';
import {StockApiService} from "../../services/stock-api.service";
import {CurrencyPipe, DecimalPipe, NgClass, NgForOf} from "@angular/common";

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
      this.stocks = data.stocks;
      console.log(this.stocks);
      for (let stock of this.stocks) {
        // call the API
        // Update the price for all
        console.log(stock);
      }
    });
  }

  deleteStock() {
    this.stocks.pop();
    // call the service
    // delete the records locally
    // delete the records in the DB and update the records for others
  }
}

export interface Stock {
  ticker: string;
  companyName: string;
  currentPrice: number;
  change: {
    amount: number;
    percentage: number;
  };
}
