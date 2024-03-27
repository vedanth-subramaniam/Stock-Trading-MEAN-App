import {Component, OnInit} from '@angular/core';
import {StockApiService} from "../../services/stock-api.service";
import {CurrencyPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-stock-portfolio',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgForOf
  ],
  templateUrl: './stock-portfolio.component.html',
  styleUrl: './stock-portfolio.component.css'
})
export class StockPortfolioComponent implements OnInit {

  walletBalance: any;
  portFolioDataList: any;


  constructor(private stockService: StockApiService) {
  }

  ngOnInit(): void {
    this.stockService.getPortfolioData().subscribe({
      next:(response) =>{
        this.portFolioDataList = response;
        console.log(this.portFolioDataList);
      }
    });

    this.stockService.getWalletBalanceDB().subscribe({
      next: (response: any) =>{
        this.walletBalance = response.balance;
        // Update the wallet balance
      }
    });
  }

  buyStock(stock: any){
    // Do the calculation to check if enough funds are there to purchase the stock
    // If yes then update the details and quanity and send it to the DB.
    // If no then error
    console.log(stock);
  }

  sellStock(stock: any){
    // Do the calculation and update the wallet balance
    // Update the records in the DB
    console.log(stock);
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
