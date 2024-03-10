import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule
  ],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.css'
})
export class StockSearchComponent implements OnInit {

  tickerSymbol: string = '';

  constructor() {
  }

  ngOnInit(): void {
    console.log("Hey");
  }

  searchStock() {
    console.log('Searching for stock:', this.tickerSymbol);
    // console.log(this.stockApiService.getCompanyCommonDetails(this.tickerSymbol));
  }

  clearSearch() {
    this.tickerSymbol = '';
    // Implement the logic to clear out the currently searched results and show the initial search page
  }
}
