import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {StockApiService} from "../stock-api.service";
import {interval, startWith, Subscription, tap} from "rxjs";

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule, ReactiveFormsModule
  ],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.css'
})
export class StockSearchComponent implements OnInit, OnDestroy {

  tickerSymbol: string = '';
  private subscriptions: Subscription = new Subscription();
  stockSearchControl = new FormControl();

  constructor(private stockService: StockApiService) {
  }

  ngOnInit() {
  }

  searchStock() {

    this.tickerSymbol = this.stockSearchControl.value;
    console.log('Searching for stock:', this.tickerSymbol);

    const apiInterval$ = interval(15000).pipe(startWith(0));

    this.subscriptions.add(
      apiInterval$.pipe(
        tap(() => this.stockService.getCompanyCommonDetailsAPI(this.tickerSymbol).subscribe(
          (response) => {
            console.log('Company Common Details:', response);
          },
          error => console.error('Error fetching Company Common Details', error)
        ))
      ).subscribe()
    );

    this.stockService.getNewsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log('News Tab Details:', response);
      }
    });

    this.stockService.getChartsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log('Charts Tab Details:', response);
      }
    });

    this.stockService.getInsightsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log('Insights Tab Details:', response);
      }
    });

  }

  clearSearch() {
    console.log("Clear search");
    this.tickerSymbol = '';
    this.subscriptions.unsubscribe();
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
