import {Component, Inject, OnInit} from '@angular/core';
import {CurrencyPipe, DecimalPipe, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {StockApiService} from "../../services/stock-api.service";

@Component({
  selector: 'app-sell-stock-dialog',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    NgIf,
    DecimalPipe
  ],
  templateUrl: './sell-stock-dialog.component.html',
  styleUrl: './sell-stock-dialog.component.css'
})
export class SellStockDialogComponent implements OnInit {
  quantity = 1;
  total = 0;
  walletBalance: number;

  constructor(
    public dialogRef: MatDialogRef<SellStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public stockService: StockApiService
  ) {
    this.walletBalance = data.walletBalance;
    this.stockService.getWalletBalanceDB().subscribe({
      next: (response: any) => this.walletBalance = response.balance,
    });
    console.log("Sell data");
    console.log(data);
    this.updateTotal(); // Initialize total
  }

  updateTotal() {
    this.total = this.data.latestPrice * this.quantity;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  confirmPurchase() {
    if (this.quantity <= this.data.stock.quantity) {
      this.data.stock.quantity -= this.quantity;
      this.data.stock.totalCost -= this.total;
      this.walletBalance += this.total;
      console.log("Selling the stock");
      console.log(this.data.stock);
      this.stockService.postIntoPortfolioData(this.data.stock).subscribe({
        next: () => console.log("Updated stock data"),
        error: (error: any) => console.log("Some error occurred while buying", error)
      });
      this.stockService.updateWalletBalanceDB(this.walletBalance).subscribe({
        next: () => console.log("Updated wallet price")
      });
      if (this.data.stock.quantity <= 0) {
        this.stockService.deleteFromPortfolioDB(this.data.stock.ticker).subscribe({
          next: () => console.log("Removed from DB")
        });
      }
      this.dialogRef.close({
        data: this.data.stock.ticker + " was sold successfully",
        show: true,
        wallet: this.walletBalance
      });
    }
  }

  ngOnInit(): void {
    console.log("From Mat Dialog");
    console.log(this.data.stock);
    console.log(this.data.walletBalance);
  }
}
