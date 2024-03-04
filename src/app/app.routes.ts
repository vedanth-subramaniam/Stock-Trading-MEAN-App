import { Routes } from '@angular/router';
import {StockSearchComponent} from "./stock-search/stock-search.component";
import {StockWishlistComponent} from "./stock-wishlist/stock-wishlist.component";
import {StockPortfolioComponent} from "./stock-portfolio/stock-portfolio.component";

export const routes: Routes = [
  { path: 'search-component', component: StockSearchComponent },
  { path: 'wishlist-component', component: StockWishlistComponent },
  { path: 'portfolio-component', component:StockPortfolioComponent}
];
