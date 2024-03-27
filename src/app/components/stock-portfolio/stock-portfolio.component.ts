import {Component, OnInit} from '@angular/core';
import {StockApiService} from "../../services/stock-api.service";
import {CurrencyPipe, NgForOf} from "@angular/common";
import {BuyStockDialogComponent} from "../buy-stock-dialog/buy-stock-dialog.component";
import {MatDialog} from "@angular/material/dialog";

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


  constructor(private stockService: StockApiService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.stockService.getPortfolioData().subscribe({
      next: (response) => {
        this.portFolioDataList = response;
        console.log(this.portFolioDataList);
      }
    });

    this.stockService.getWalletBalanceDB().subscribe({
      next: (response: any) => {
        this.walletBalance = response.balance;
        // Update the wallet balance
      }
    });
  }

  buyStock(stock: any) {
    console.log("Buying stock:", stock);
    const dialogRef = this.dialog.open(BuyStockDialogComponent, {
      width: '400px',
      data: {stock: stock, walletBalance: this.walletBalance}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  sellStock(stock: any) {
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
