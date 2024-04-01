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
import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgOptimizedImage,
  NgTemplateOutlet
} from "@angular/common";
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
import {BuyStockDialogComponent} from "../buy-stock-dialog/buy-stock-dialog.component";
import {response} from "express";
import {SellStockDialogComponent} from "../sell-stock-dialog/sell-stock-dialog.component";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ActivatedRoute, Router} from "@angular/router";

// Initialize the module
HC_stock(Highcharts);
indicatorsAll(Highcharts);
indicators(Highcharts);
volumeByPrice(Highcharts);

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule, ReactiveFormsModule, NgForOf, NgIf, MatAutocomplete, MatOption, AsyncPipe, MatFormField, MatAutocompleteTrigger, MatInput, DatePipe, NgOptimizedImage, MatTabGroup, MatTab, NgTemplateOutlet, MatCard, MatCardHeader, MatCardTitle, MatCardTitleGroup, MatCardContent, MatCardSubtitle, MatCardSmImage, HighchartsChartModule, MatIcon, NgClass, NgbAlert, MatTable, MatHeaderRow, MatRow, MatColumnDef, MatHeaderRowDef, MatRowDef, MatHeaderCell, MatCell, MatHeaderCellDef, MatCellDef, DecimalPipe, MatProgressSpinner
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
  insightsRecommendationChartOptions: any;
  insightsSurpriseChartOptions: any;
  chartsHourlyResponse: any;
  chartsHourlyDataList: any;

  showSpinner: boolean = false;
  showSpinnerSearch: boolean = false;
  aggregatedSentimentData: any;
  aggregateSentimentTable: any;

  portfolioBoughtAlertMessage: any;
  portfolioAlertSoldMessage: any;
  wishlistAlertMessageAdded: any;
  wishlistAlertMessageRemoved: any;
  portfolioBoughtAlertMessageBoolean: boolean = false;
  portfolioAlertSoldMessageBoolean: boolean = false;
  wishlistAlertMessageAddedBoolean: boolean = false;
  wishlistAlertMessageRemovedBoolean: boolean = false;

  stockPortfolioData: any;

  walletBalance = 0;
  // References to the template elements
  @ViewChild('summaryTab') summaryTemplate!: TemplateRef<any>;
  @ViewChild('newsTab') newsTemplate!: TemplateRef<any>;
  @ViewChild('chartsTab') chartsTemplate!: TemplateRef<any>;
  @ViewChild('insightsTab') insightsTemplate!: TemplateRef<any>;

  constructor(private stockService: StockApiService, public dialog: MatDialog, protected stockStateService: StockStateService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe(params => {
      const companyName = params['ticker'];
      if (companyName) {
        this.searchStock(companyName);
      }
    });

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
      this.isFavorite = state.isFavorite;
      this.insightsSurpriseChartOptions = state.insightsSurpriseChartOptions;
      this.insightsRecommendationChartOptions = state.insightsRecommendationChartOptions;
      this.aggregateSentimentTable = state.aggregateSentimentTable;
      this.aggregatedSentimentData = state.aggregatedSentimentData;
      this.stockSearchControl.setValue(state.searchInputValue);
    }
    this.stockService.getTickerWishListDB(this.tickerSymbol).subscribe({
      next: (response: any) => {
        console.log("Stock has been fetched from wishlist");
        this.isFavorite = true;
      },
      error: (error: any) => {
        this.isFavorite = false;
      }
    });
    this.autocompleteSearchResults = [];
    this.stockSearchControl.valueChanges.pipe(
      debounceTime(700), // Wait for 700ms pause in events
      distinctUntilChanged(), // Only emit when the current value is different from the last
      tap(() => {
        this.autocompleteSearchResults = [];
      }), // Reset results on new search
      filter(value => value != null && value.trim() != ''), // Filter out empty or null values
      tap(() => {
        this.showSpinner = true;
      }),
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
      this.showSpinner = false;
      console.log("Autocomplete results:", results.result);
      this.autocompleteSearchResults = results.result;
      this.autocompleteSearchResults = this.autocompleteSearchResults.filter(option => !option.displaySymbol.includes('.'));
    });
  }

  changeRoute(searchInput: any) {
    this.router.navigate(['/search'], {queryParams: {ticker: searchInput}});
  }

  searchStock(searchInput: any) {
    this.portfolioBoughtAlertMessageBoolean = false;
    this.autocompleteSearchResults = [];
    this.showSpinner = false;
    this.stockSearchControl.setValue(searchInput);
    this.tickerSymbol = searchInput.toUpperCase();
    this.errorMessage = false;
    this.currentTab = "";
    console.log('Searching for stock:', this.tickerSymbol);

    const apiInterval$ = interval(15000).pipe(startWith(0));
    this.showSpinnerSearch = true;
    console.log("Mat spinner search");
    console.log(this.showSpinnerSearch);
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
            fetchPortfolioAndWallet();
            this.onStateChange();
            if (this.companyInfoResponse.companyPeers.length == 0) {
              console.log("Empty");
              this.currentTab = "";
              this.errorMessage = true;
            }
            console.log('State changes inside company details', this.stockStateService.getState());
            this.showSpinnerSearch = false;
            this.showSpinner = false;
          },
          error => {
            console.error('Error fetching Company Common Details', error);
          },
        ))
      ).subscribe({
        next: (response: any) => {
          console.log("Company details over")
        }
      })
    );

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
        this.aggregateData(this.insightsResponse.insiderSentiments.data);
        this.getInsightsSurpriseChartOptions();
        this.getInsightRecommendationsChartOptions();
      }
    });

    const fetchPortfolioAndWallet = () => {
      this.stockService.getSingleRecordPortfolioDB(this.tickerSymbol).subscribe({
        next: (response: any) => {
          this.stockPortfolioData = response;
          console.log("Stock Portfolio Data", this.stockPortfolioData);
          this.onStateChange();
        },
        error: (error: any) => {
          console.log("Error in fetching stock portfolio data for company", error);
          this.stockPortfolioData = {
            ticker: this.tickerSymbol,
            companyName: this.stockProfile?.name,
            quantity: 0,
            avgCostPerShare: 0,
            totalCost: 0,
            change: 0,
            currentPrice: 0,
            marketValue: 0
          };
        }
      });

      this.stockService.getTickerWishListDB(this.tickerSymbol).subscribe({
        next: (response: any) => {
          console.log("Stock has been fetched from wishlist");
          this.isFavorite = true;
        },
        error: (error: any) => {
          this.isFavorite = false;
        }
      });
      this.stockService.getWalletBalanceDB().subscribe({
        next: (response: any) => {
          console.log("Wallet fetched from DB");
          this.walletBalance = response.balance;
        }
      });
    }

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

  getProfitOrLossCP() {
    return this.latestPrice?.d >= 0;
  }

  openDialog(newsDetail: any): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {top: '2%'};
    dialogConfig.width = '500px';
    dialogConfig.height = '400px';
    dialogConfig.panelClass = 'my-custom-dialog';
    dialogConfig.data = newsDetail;
    this.dialog.open(NewsDetailsDialogComponent, dialogConfig);
  }

  buyStock(stock: any) {
    console.log("Buying stock:", stock);
    this.portfolioBoughtAlertMessageBoolean = false;
    const dialogRef = this.dialog.open(BuyStockDialogComponent, {
      width: '400px',
      position: {top: '2%'},
      data: {stock: this.stockPortfolioData, walletBalance: this.walletBalance, latestPrice: this.latestPrice.c}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.portfolioBoughtAlertMessage = false;
      if (result.show) {
        this.portfolioBoughtAlertMessage = result.data;
        this.portfolioBoughtAlertMessageBoolean = true;
      }
    });
  }

  sellStock(stock: any) {
    console.log("Selling stock:", stock);
    const dialogRef = this.dialog.open(SellStockDialogComponent, {
      width: '400px',
      position: {top: '2%'},
      data: {stock: this.stockPortfolioData, walletBalance: this.walletBalance, latestPrice: this.latestPrice}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result.show) {
        this.portfolioAlertSoldMessage = result.data;
        this.portfolioAlertSoldMessageBoolean = true;
      }
    });
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

  getHourlyChartsOptions() {

    let stockPriceData = this.chartsHourlyDataList.map((item: any) => [item.t, item.o]);
    let chartColour = this.getProfitOrLossCP() ? 'FF0000FF' : '008000FF';
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
        data: stockPriceData// data should be filled in here.
      }]
    };
  }

  getInsightRecommendationsChartOptions() {
    console.log(this.insightsResponse.stockRecommendations);

    this.insightsRecommendationChartOptions = {
      chart: {
        type: "column",
        backgroundColor: "#f7f6f7",
      },
      title: {
        text: "Recommendation Trends",
        align: "center",
      },
      xAxis: {
        categories: this.insightsResponse.stockRecommendations.map((rec: any) => rec.period),
      },
      yAxis: {
        min: 0,
        title: {
          text: "# Analysis",
        },
        stackLabels: {
          enabled: false,
        },
      },
      plotOptions: {
        column: {
          stacking: "normal",
          dataLabels: {
            enabled: true,
          },
        },
      },
      series: [
        {
          name: "Strong Buy",
          data: this.insightsResponse.stockRecommendations.map((rec: any) => rec.strongBuy),
          color: "#1a6334",
        },
        {
          name: "Buy",
          data: this.insightsResponse.stockRecommendations.map((rec: any) => rec.buy),
          color: "#22ae50",
        },
        {
          name: "Hold",
          data: this.insightsResponse.stockRecommendations.map((rec: any) => rec.hold),
          color: "#ae7c27",
        },
        {
          name: "Sell",
          data: this.insightsResponse.stockRecommendations.map((rec: any) => rec.sell),
          color: "#f04e53",
        },
        {
          name: "Strong Sell",
          data: this.insightsResponse.stockRecommendations.map((rec: any) => rec.strongSell),
          color: "#752a2a",
        },
      ],
    }
  }

  getInsightsSurpriseChartOptions() {
    console.log(this.insightsResponse.companyEarnings);

    let actual_data: any = [];
    let estimate_data: any = [];
    let periods: any = [];
    let surprises: any = [];

    this.insightsResponse.companyEarnings.map((rec: any) => {
      actual_data.push(rec.actual == null ? 0 : rec.actual);
      estimate_data.push(rec.estimate == null ? 0 : rec.estimate);
      periods.push(rec.period);
      surprises.push("Surprise : " + rec.surprise.toString());
    });

    this.insightsSurpriseChartOptions = {
      chart: {
        backgroundColor: "#f7f6f7",
        type: "spline",
      },
      title: {
        text: "Historical EPS Surprises",
      },
      xAxis: [
        {
          categories: periods,
        },
        {
          categories: surprises,
          offset: 70,
          linkedTo: 0,
          opposite: false,
          labels: {y: -14},
        },
      ],
      yAxis: {
        title: {
          text: "Quarterly EPS",
        },
      },
      tooltip: {
        shared: true,
      },
      series: [
        {
          name: "Actual",
          data: actual_data,
        },
        {
          name: "Estimate",
          data: estimate_data,
        },
      ],
    }
  }

  clearSearch() {
    console.log("Clear search");
    this.stockSearchControl.reset();
    this.tickerSymbol = '';
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
    this.currentTab = "";
    this.errorMessage = false;
    this.showSpinner = false;
    this.showSpinnerSearch = false;
    console.log(this.showSpinnerSearch);
    console.log(this.showSpinner);
    this.onStateChange();
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
      insightsRecommendationChartOptions: this.insightsRecommendationChartOptions,
      insightsSurpriseChartOptions: this.insightsSurpriseChartOptions,
      searchInputValue: this.stockSearchControl.value,
      aggregateSentimentTable: this.aggregateSentimentTable,
      aggregatedSentimentData: this.aggregatedSentimentData,
      isFavorite: this.isFavorite
    });
  }

  ngOnDestroy() {
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
  }

  protected readonly auto = auto;
  protected readonly console = console;
  isFavorite: boolean = false;

  toggleFavorite() {
    console.log("THis is the value of favourite", this.isFavorite);
    this.isFavorite = !this.isFavorite;

    if (this.isFavorite) {
      let stockData = {
        "stockTicker": this.tickerSymbol,
        "companyName": this.stockProfile.name,
        "currentPrice": this.latestPrice.c,
        "change": {
          "amount": this.latestPrice.d,
          "percentage": this.latestPrice.dp
        }
      }
      this.wishlistAlertMessageAddedBoolean = true;
      this.stockService.postIntoWishListData(stockData).subscribe({
        next: (response: any) => {
          console.log(response);
          console.log("Added to wishlist");
        }
      });
    } else {
      this.wishlistAlertMessageRemovedBoolean = true;
      this.stockService.deleteFromWishlistDB(this.tickerSymbol).subscribe({
        next: (response: any) => {
          console.log("Removed from wishlist");
        }
      });
    }
    this.onStateChange();
    console.log("Button clicked");

  }

  aggregateData(data: any): any {

    let totalMspr = 0;
    let positiveMspr = 0;
    let negativeMspr = 0;
    let totalChange = 0;
    let positiveChange = 0;
    let negativeChange = 0;

    for (const item of data) {
      totalMspr += item.mspr;
      totalChange += item.change;

      if (item.mspr > 0) {
        positiveMspr += item.mspr;
      } else {
        negativeMspr += item.mspr;
      }

      if (item.change > 0) {
        positiveChange += item.change;
      } else {
        negativeChange += item.change;
      }
    }

    let aggregatedSentimentData = {
      totalMspr,
      positiveMspr,
      negativeMspr,
      totalChange,
      positiveChange,
      negativeChange
    };

    this.aggregateSentimentTable = [
      {
        field: 'Total',
        mspr: aggregatedSentimentData.totalMspr,
        change: aggregatedSentimentData.totalChange
      },
      {
        field: 'Positive',
        mspr: aggregatedSentimentData.positiveMspr,
        change: aggregatedSentimentData.positiveChange
      },
      {
        field: 'Negative',
        mspr: aggregatedSentimentData.negativeMspr,
        change: aggregatedSentimentData.negativeChange
      }
    ];
  }

  protected readonly Date = Date;
}

export interface StockOption {
  displaySymbol: string;
  description: string;
}

export interface StockPortfolioRecord {
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
