import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.css'
})
export class StockSearchComponent implements OnInit {


  ngOnInit(): void {
    console.log("Hey");
  }

}
