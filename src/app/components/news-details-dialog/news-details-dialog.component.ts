import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatAnchor, MatButton} from "@angular/material/button";

@Component({
  selector: 'app-news-details-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatAnchor,
    MatButton,
    MatDialogClose,
    MatDialogTitle
  ],
  templateUrl: './news-details-dialog.component.html',
  styleUrl: './news-details-dialog.component.css'
})
export class NewsDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

}
