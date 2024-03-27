import {Component, OnInit} from '@angular/core';
import {StockApiService} from "../../services/stock-api.service";

@Component({
  selector: 'app-stock-portfolio',
  standalone: true,
  imports: [],
  templateUrl: './stock-portfolio.component.html',
  styleUrl: './stock-portfolio.component.css'
})
export class StockPortfolioComponent implements OnInit {

  walletBalance: any;
  constructor(private stockService: StockApiService) {
  }

  ngOnInit(): void {
    this.stockService.getPortfolioData().subscribe({
      next:(response) =>{
        console.log(response);
        // Iterate over the data
      }
    });

    this.stockService.getWalletBalanceDB().subscribe({
      next: (response) =>{
        console.log(response);
        // Update the wallet balance
      }
    });
  }

  buyStock(){
    // Do the calculation to check if enough funds are there to purchase the stock
    // If yes then update the details and quanity and send it to the DB.
    // If no then error
  }

  sellStock(){
    // Do the calculation and update the wallet balance
    // Update the records in the DB
  }
}

export interface StockRecord {
  _id: any,
  ticker: string,
  companyName: string,
  quantity: number,
  avgCostPerShare: number,
  totalCost: number,
  change: number,
  currentPrice: number,
  marketValue: number
}
