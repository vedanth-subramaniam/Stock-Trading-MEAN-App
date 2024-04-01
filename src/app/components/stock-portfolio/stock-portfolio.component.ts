import {Component, OnInit} from '@angular/core';
import {StockApiService} from "../../services/stock-api.service";
import {CurrencyPipe, DecimalPipe, NgForOf} from "@angular/common";
import {BuyStockDialogComponent} from "../buy-stock-dialog/buy-stock-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {SellStockDialogComponent} from "../sell-stock-dialog/sell-stock-dialog.component";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-stock-portfolio',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgForOf,
    NgbAlert,
    DecimalPipe
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
        for (let stock of this.portFolioDataList) {
          this.stockService.getLatestStockPrice(stock.ticker).subscribe({
            next: (response: any) => {
              console.log("Fetching latest price for ", stock.ticker);
              stock.currentPrice = response.c;
            }
          })
        }
      }
    });

    this.stockService.getWalletBalanceDB().subscribe({
      next: (response: any) => {
        this.walletBalance = response.balance;
      }
    });
  }

  buyStock(stock: any, index: number) {
    console.log("Buying stock:", stock);
    const dialogRef = this.dialog.open(BuyStockDialogComponent, {
      width: '400px',
      position: {top: '2%'},
      data: {stock: stock, walletBalance: this.walletBalance, latestPrice: stock.currentPrice}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.walletBalance = result.wallet;
    });
  }

  sellStock(stock: any, index: number) {
    console.log("Selling stock:", stock);
    const dialogRef = this.dialog.open(SellStockDialogComponent, {
      width: '400px',
      position: {top: '2%'},
      data: {stock: stock, walletBalance: this.walletBalance, latestPrice: stock.currentPrice}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.walletBalance = result.wallet;
      if (stock.quantity <= 0) {
        this.stockService.deleteFromPortfolioDB(stock.ticker).subscribe({
          next: () => console.log("Removed from DB")
        });
        this.portFolioDataList.splice(index, 1);
      }
    });
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
