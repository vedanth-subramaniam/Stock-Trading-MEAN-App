// stock-state.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StockStateService {
  private state: any = {};

  saveState(state: any) {
    this.state = state;
  }

  getState() {
    return this.state;
  }
}