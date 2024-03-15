import {Routes} from '@angular/router';
import {StockSearchComponent} from "./components/stock-search/stock-search.component";
import {StockWishlistComponent} from "./components/stock-wishlist/stock-wishlist.component";
import {StockPortfolioComponent} from "./components/stock-portfolio/stock-portfolio.component";

export const routes: Routes = [
  {path: 'search', component: StockSearchComponent},
  {path: 'search/:stockTicker', component:StockSearchComponent},
  {path: 'wishlist', component: StockWishlistComponent},
  {path: 'portfolio', component: StockPortfolioComponent},
  {path: '', component: StockSearchComponent}
];
