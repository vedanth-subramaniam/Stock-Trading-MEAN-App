import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {StockApiService} from "../stock-api.service";

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

  constructor(private stockService: StockApiService) {
  }

  ngOnInit(): void {
    console.log("Hey");
  }

  searchStock() {
    console.log('Searching for stock:', this.tickerSymbol);

    this.stockService.getCompanyCommonDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log(response);
      }
    });

    this.stockService.getNewsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log(response);
      }
    });

    this.stockService.getChartsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log(response);
      }
    });

    this.stockService.getInsightsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log(response);
      }
    });

  }

  clearSearch() {
    this.tickerSymbol = '';
    // Implement the logic to clear out the currently searched  results and show the initial search page
  }
}
