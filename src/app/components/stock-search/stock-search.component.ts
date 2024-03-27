import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  interval, of,
  startWith,
  Subscription,
  switchMap,
  tap
} from "rxjs";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {auto} from "@popperjs/core";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {
  MatCard,
  MatCardContent,
  MatCardHeader, MatCardSmImage,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup
} from "@angular/material/card";
import {StockApiService} from "../../services/stock-api.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {NewsDetailsDialogComponent} from "../news-details-dialog/news-details-dialog.component";
import {StockStateService} from '../../services/stock-state.service';
import {HighchartsChartModule} from "highcharts-angular";
import * as Highcharts from 'highcharts';
import indicators from 'highcharts/indicators/indicators';
import volumeByPrice from 'highcharts/indicators/volume-by-price';
import HC_stock from 'highcharts/modules/stock';
import indicatorsAll from 'highcharts/indicators/indicators-all'
import {MatIcon} from "@angular/material/icon";

// Initialize the module
HC_stock(Highcharts);
indicatorsAll(Highcharts);
indicators(Highcharts);
volumeByPrice(Highcharts);

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule, ReactiveFormsModule, NgForOf, NgIf, MatAutocomplete, MatOption, AsyncPipe, MatFormField, MatAutocompleteTrigger, MatInput, DatePipe, NgOptimizedImage, MatTabGroup, MatTab, NgTemplateOutlet, MatCard, MatCardHeader, MatCardTitle, MatCardTitleGroup, MatCardContent, MatCardSubtitle, MatCardSmImage, HighchartsChartModule, MatIcon, NgClass
  ],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.css'
})
export class StockSearchComponent implements OnInit, OnDestroy {

  tickerSymbol: string = '';
  private subscriptions: Subscription = new Subscription();
  stockSearchControl = new FormControl();
  autocompleteSearchResults: StockOption[] = [];

  currentTab = "";

  companyInfoResponse!: any;
  companyPeers: any;
  latestPrice: any;
  stockProfile: any;
  stockPortfolioData: any;

  newsResponse!: any;
  chartResponse!: any;
  insightsResponse!: any;

  selectedIndex: number = 0;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: any;
  ohlcCharts: any = [];
  volumeCharts: any = [];
  maxVolumeData = Number.MIN_VALUE;
  errorMessage: boolean = false;
  chartOptionsSummary: any;
  chartsHourlyResponse: any;
  chartsHourlyDataList: any;
  // References to the template elements
  @ViewChild('summaryTab') summaryTemplate!: TemplateRef<any>;
  @ViewChild('newsTab') newsTemplate!: TemplateRef<any>;
  @ViewChild('chartsTab') chartsTemplate!: TemplateRef<any>;
  @ViewChild('insightsTab') insightsTemplate!: TemplateRef<any>;

  constructor(private stockService: StockApiService, public dialog: MatDialog, protected stockStateService: StockStateService) {
  }

  ngOnInit() {

    console.log("Search component Init");
    const state = this.stockStateService.getState();
    console.log('State:', state);
    if (state) {
      this.tickerSymbol = state.tickerSymbol;
      this.companyInfoResponse = state.companyInfoResponse;
      this.chartsHourlyResponse = state.chartsHourlyResponse;
      this.chartsHourlyDataList = state.chartsHourlyDataList;
      this.chartOptions = state.chartOptions;
      this.chartOptionsSummary = state.chartOptionsSummary;
      this.companyPeers = state.companyPeers;
      this.latestPrice = state.latestPrice;
      this.stockProfile = state.stockProfile;
      this.newsResponse = state.newsResponse;
      this.chartResponse = state.chartResponse;
      this.insightsResponse = state.insightsResponse;
      this.currentTab = state.currentTab;
      this.stockPortfolioData = state.stockPortfolioData;
      this.stockSearchControl.setValue(state.searchInputValue);
    }
    this.autocompleteSearchResults = [];
    this.stockSearchControl.valueChanges.pipe(
      debounceTime(700), // Wait for 700ms pause in events
      distinctUntilChanged(), // Only emit when the current value is different from the last
      tap(() => this.autocompleteSearchResults = []), // Reset results on new search
      filter(value => value != null && value.trim() != ''), // Filter out empty or null values
      switchMap(value =>
        this.stockService.getAutocompleteAPI(value).pipe(
          catchError(error => {
            // Handle or log the error
            console.error('Error fetching autocomplete results:', error);
            return of([]); // Return an empty array or appropriate fallback value on error
          })
        )
      )
    ).subscribe((results: any) => {
      console.log("Autocomplete results:", results.result);
      this.autocompleteSearchResults = results.result;
      this.autocompleteSearchResults = this.autocompleteSearchResults.filter(option => !option.displaySymbol.includes('.'));
    });
  }

  searchStock(searchInput: any) {
    this.stockSearchControl.setValue(searchInput);
    this.tickerSymbol = searchInput.toUpperCase();
    this.errorMessage = false;
    this.currentTab = "";
    console.log('Searching for stock:', this.tickerSymbol);

    const apiInterval$ = interval(15000).pipe(startWith(0));

    this.subscriptions.add(
      apiInterval$.pipe(
        tap(() => this.stockService.getCompanyCommonDetailsAPI(this.tickerSymbol).subscribe(
          (response) => {
            this.companyInfoResponse = response;
            console.log('Company Common Details:', this.companyInfoResponse);
            this.stockProfile = this.companyInfoResponse.stockProfile;
            this.latestPrice = this.companyInfoResponse.latestPrice;
            this.companyPeers = this.companyInfoResponse.companyPeers;
            this.currentTab = "Summary";
            this.onStateChange();
            if (this.companyInfoResponse.companyPeers.length == 0) {
              console.log("Empty");
              this.currentTab = "";
              this.errorMessage = true;
            }
            console.log('State changes inside company details', this.stockStateService.getState());
          },
          error => console.error('Error fetching Company Common Details', error)
        ))
      ).subscribe()
    );

    this.stockService.getSingleRecordPortfolioDB(this.tickerSymbol).subscribe({
      next: (response: any) => {
        this.stockPortfolioData = response;
        console.log("Stock Portfolio Data", this.stockPortfolioData);
      },
      error: (error: any) => {
        if (error.status == "404") {
          this.stockPortfolioData.quantity = 0;
        }
      }
    });

    this.stockService.getTickerWishListDB(this.tickerSymbol).subscribe({
      next:(response:any) => {
        console.log("Stock has been fetched from wishlist");
        this.isFavorite = true;
      },
      error: (error: any) => {
        this.isFavorite = false;
      }
    })

    this.stockService.getChartsHourlyDetailsAPI(this.tickerSymbol).subscribe({
      next: (response) => {
        this.chartsHourlyResponse = response;
        this.chartsHourlyDataList = this.chartsHourlyResponse.results;
        console.log("Charts Hourly Data");
        console.log(this.chartsHourlyDataList);
        this.getHourlyChartsOptions();
      }
    })

    this.stockService.getNewsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        this.newsResponse = response;
        console.log('News Tab Details:', this.newsResponse);
      }
    });

    this.stockService.getChartsTabDetailsAPI(this.tickerSymbol.toUpperCase()).subscribe({
      next: (response: any) => {
        this.chartResponse = response;
        console.log('Charts Tab Details:', this.chartResponse);
        let jsonData = this.chartResponse.results;
        let tempOhlcCharts: any = [];
        let tempVolumeCharts: any = [];
        jsonData.forEach((item: { t: any; c: any; v: any; o: any; h: any; l: any; }) => {
          let date = item.t;
          let volume = item.v;
          let open = item.o;
          let high = item.h;
          let low = item.l;
          let close = item.c;

          tempOhlcCharts.push([date, open, high, low, close]);
          tempVolumeCharts.push([date, volume]);
          this.maxVolumeData = Math.max(this.maxVolumeData, volume);
        });
        this.ohlcCharts = [...tempOhlcCharts];
        this.volumeCharts = [...tempVolumeCharts];

        console.log("OHLC DATA", this.ohlcCharts);
        console.log("Volume data", this.volumeCharts);
        this.getChartsTabGraph(this.ohlcCharts, this.volumeCharts);
      }
    });

    this.stockService.getInsightsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        this.insightsResponse = response;
        console.log('Insights Tab Details:', this.insightsResponse);
      }
    });

    this.onStateChange();
    console.log('State changes', this.stockStateService.getState());
  }

  selectTab(index: number) {
    this.selectedIndex = index;
  }

  getTemplate() {
    switch (this.selectedIndex) {
      case 0:
        return this.summaryTemplate;
      case 1:
        return this.newsTemplate;
      case 2:
        return this.chartsTemplate;
      case 3:
        return this.insightsTemplate;
      default:
        return null;
    }
  }

  getMarketStatus() {
    const currentDate = new Date();
    const timestampDate = new Date(this.latestPrice?.t * 1000);

    const difference = currentDate.getTime() - timestampDate.getTime();

    return difference > (5 * 60 * 1000);
  }

  openDialog(newsDetail: any): void {

    const dialogConfig = new MatDialogConfig();

    // Set the position of the dialog
    dialogConfig.position = {top: '2%'}; // You can adjust '0' to another value to suit your needs
    // Add other configuration settings as needed, like width, height, etc.
    dialogConfig.width = '500px';
    dialogConfig.height = '400px';

    // If you want to add custom classes for styling, use the panelClass property
    dialogConfig.panelClass = 'my-custom-dialog';
    dialogConfig.data = newsDetail;
    this.dialog.open(NewsDetailsDialogComponent, dialogConfig);
  }

  getChartsTabGraph(ohlc: any, volume: any) {

    console.log("Charts options");
    let groupingUnits = [[
      'day',
      [1]
    ], [
      'month',
      [1, 2, 3, 4, 6]
    ]];
    this.chartOptions = {
      chart: {
        type: 'stock'
      },
      rangeSelector: {
        selected: 2
      },

      title: {
        text: this.chartResponse.ticker + ' Historical'
      },

      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },

      yAxis: [{
        startOnTick: false,
        endOnTick: false,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: true
        }
      }, {
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
      }],

      tooltip: {
        split: true
      },

      plotOptions: {
        series: {
          dataGrouping: {
            units: groupingUnits
          }
        }
      },

      series: [{
        type: 'candlestick',
        name: this.chartResponse.ticker,
        id: this.chartResponse.ticker.toLowerCase(),
        zIndex: 2,
        data: ohlc
      }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: volume,
        yAxis: 1
      }, {
        type: 'vbp',
        linkedTo: this.chartResponse.ticker.toLowerCase(),
        params: {
          volumeSeriesID: 'volume'
        },
        dataLabels: {
          enabled: false
        },
        zoneLines: {
          enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: this.chartResponse.ticker.toLowerCase(),
        zIndex: 1,
        marker: {
          enabled: false
        }
      }]
    };
    console.log("Value of chartoptions");
    console.log(this.chartOptions);
  }

  onStateChange() {
    // When the state changes, save it to the service
    console.log("Current tab before saving state", this.currentTab);
    this.stockStateService.saveState({
      tickerSymbol: this.tickerSymbol,
      companyInfoResponse: this.companyInfoResponse,
      companyPeers: this.companyPeers,
      latestPrice: this.latestPrice,
      stockProfile: this.stockProfile,
      newsResponse: this.newsResponse,
      chartResponse: this.chartResponse,
      insightsResponse: this.insightsResponse,
      currentTab: this.currentTab,
      stockPortfolioData: this.stockPortfolioData,
      chartHourlyResponse: this.chartsHourlyResponse,
      chartsHourlyDataList: this.chartsHourlyDataList,
      chartOptions: this.chartOptions,
      chartOptionsSummary: this.chartOptionsSummary,
      searchInputValue: this.stockSearchControl.value,
      isFavorite: this.isFavorite
    });
  }

  getHourlyChartsOptions() {

    let stockPriceData = this.chartsHourlyDataList.map((item: any) => [item.t, item.o]);

    this.chartOptionsSummary = {
      chart: {
        type: 'line'
      },
      title: {
        text: this.chartsHourlyResponse.ticker + ' Hourly Price Variation'
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          month: '%e. %b',
          year: '%b'
        },
        title: {
          text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: 'Price (USD)'
        }
      },
      series: [{
        name: this.chartsHourlyResponse.ticker + ' Stock Price',
        data: stockPriceData // data should be filled in here
      }]
      // other chart options
    };
  }

  clearSearch() {
    console.log("Clear search");
    this.stockSearchControl.reset();
    this.tickerSymbol = '';
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
    this.currentTab = "";
    this.errorMessage = false;
  }

  ngOnDestroy() {
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
  }

  protected readonly auto = auto;
  protected readonly console = console;
  isFavorite: boolean = false;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;

    if(this.isFavorite) {
      let stockData = {
        "stockTicker": this.tickerSymbol,
        "companyName": this.stockProfile.name,
        "currentPrice": this.latestPrice.c,
        "change": {
          "amount": this.latestPrice.d,
          "percentage": this.latestPrice.dp
        }
      }
      this.stockService.postIntoWishListData(stockData).subscribe({
        next: (response: any) => {
          console.log(response);
          console.log("Added to wishlist");
        }
      });
    } else {
      this.stockService.deleteFromWishlistDB(this.tickerSymbol).subscribe({
        next: (response:any) => {
          console.log("Removed from wishlist");
        }
      });
    }
    this.onStateChange();
    console.log("Button clicked");

  }
}

interface StockOption {
  displaySymbol: string;
  description: string;
}

interface StockPortfolioRecord {
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
