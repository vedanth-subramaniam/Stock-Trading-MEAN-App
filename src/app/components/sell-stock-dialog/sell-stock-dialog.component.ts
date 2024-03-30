import {Component, Inject, OnInit} from '@angular/core';
import {CurrencyPipe, NgIf} from "@angular/common";
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
    NgIf
  ],
  templateUrl: './sell-stock-dialog.component.html',
  styleUrl: './sell-stock-dialog.component.css'
})
export class SellStockDialogComponent implements OnInit{
  quantity = 1;
  total = 0;
  walletBalance: number;

  constructor(
    public dialogRef: MatDialogRef<SellStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.walletBalance = data.walletBalance;
    this.updateTotal(); // Initialize total
  }

  updateTotal() {
    this.total = this.data.latestPrice * this.quantity;
  }

  confirmPurchase() {
    if (this.total <= this.walletBalance) {
      this.dialogRef.close(this.quantity);
    }
    this.dialogRef.close({data:  this.data.stock.ticker + " was sold successfully", show: true});
  }

  ngOnInit(): void {
    console.log("From Mat Dialog");
    console.log(this.data.stock);
    console.log(this.data.walletBalance);
  }
}
