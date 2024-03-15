import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockWishlistComponent } from './stock-wishlist.component';

describe('StockWishlistComponent', () => {
  let component: StockWishlistComponent;
  let fixture: ComponentFixture<StockWishlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockWishlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockWishlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
