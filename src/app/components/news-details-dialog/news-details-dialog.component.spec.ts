import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsDetailsDialogComponent } from './news-details-dialog.component';

describe('NewsDetailsDialogComponent', () => {
  let component: NewsDetailsDialogComponent;
  let fixture: ComponentFixture<NewsDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsDetailsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
