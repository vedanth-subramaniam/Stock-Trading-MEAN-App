import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {CurrencyPipe, NgIf} from "@angular/common";
import {StockApiService} from "../../services/stock-api.service";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-buy-stock-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatFormField,
    FormsModule,
    MatDialogActions,
    MatButton,
    MatInput,
    CurrencyPipe,
    MatDialogClose,
    MatDialogTitle,
    MatLabel,
    NgIf
  ],
  templateUrl: './buy-stock-dialog.component.html',
  styleUrl: './buy-stock-dialog.component.css'
})
export class BuyStockDialogComponent implements OnInit {

  quantity = 1;
  total = 0;
  walletBalance: number;

  constructor(
    public dialogRef: MatDialogRef<BuyStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public stockService: StockApiService
  ) {
    this.stockService.getWalletBalanceDB().subscribe({
      next:(response: any) => this.walletBalance = response.balance,
    });
    this.walletBalance = data.walletBalance;
    this.updateTotal(); // Initialize total
  }

  updateTotal() {
    this.total = this.data.latestPrice * this.quantity;
  }

  confirmPurchase() {
    if (this.total <= this.walletBalance) {
      this.data.stock.quantity += this.quantity;
      this.data.stock.totalCost += this.total;
      console.log("Buying the following stock");
      console.log(this.data.stock);
      this.stockService.postIntoPortfolioData(this.data.stock).subscribe({
        next: () => console.log("Updated stock data"),
        error: (error: any) => console.log("Some error occurred while buying", error)
      });
      this.walletBalance -= this.total;
      this.stockService.updateWalletBalanceDB(this.walletBalance).subscribe({
        next: () => console.log("Updated wallet price")
      })
      this.dialogRef.close(this.quantity);
    }
  }

  ngOnInit(): void {
    console.log("From Mat Dialog");
    console.log(this.data.stock);
    console.log(this.data.walletBalance);
  }
}
