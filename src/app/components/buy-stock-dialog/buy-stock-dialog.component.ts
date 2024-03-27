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
import {CurrencyPipe} from "@angular/common";

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
    MatLabel
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
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.walletBalance = data.walletBalance;
    this.updateTotal(); // Initialize total
  }

  updateTotal() {
    this.total = this.data.stock.currentPrice * this.quantity;
  }

  confirmPurchase() {
    if (this.total <= this.walletBalance) {
      this.dialogRef.close(this.quantity);
    }
  }

  ngOnInit(): void {
    console.log("From Mat Dialog");
    console.log(this.data.stock);
    console.log(this.data.walletBalance);
  }


}
