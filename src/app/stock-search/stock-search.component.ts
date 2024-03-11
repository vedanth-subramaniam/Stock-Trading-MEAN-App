import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {StockApiService} from "../stock-api.service";
import {debounceTime, filter, interval, startWith, Subscription, switchMap, tap} from "rxjs";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {auto} from "@popperjs/core";

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule, ReactiveFormsModule, NgForOf, NgIf, MatAutocomplete, MatOption, AsyncPipe, MatFormField, MatAutocompleteTrigger, MatInput
  ],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.css'
})
export class StockSearchComponent implements OnInit, OnDestroy {

  tickerSymbol: string = '';
  private subscriptions: Subscription = new Subscription();
  stockSearchControl = new FormControl();
  autocompleteSearchResults: any = [];

  constructor(private stockService: StockApiService) {
  }

  ngOnInit() {

    this.stockSearchControl.valueChanges
      .pipe(
        debounceTime(500),
        filter(value => value != null && value.trim() != ''),// wait for 500ms pause in events
        switchMap(value => this.stockService.getAutocompleteAPI(value)) // switch to new search observable each time the term changes
      )
      .subscribe((results: any) => {
        console.log("Autocomplete results: " + results.result);
        this.autocompleteSearchResults = results.result;
      });
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
    this.stockSearchControl.reset();
    this.tickerSymbol = '';
    this.subscriptions.unsubscribe();
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
  }

  protected readonly auto = auto;
}
