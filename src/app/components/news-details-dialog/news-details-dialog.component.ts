import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatAnchor, MatButton} from "@angular/material/button";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-news-details-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatAnchor,
    MatButton,
    MatDialogClose,
    MatDialogTitle,
    DatePipe
  ],
  templateUrl: './news-details-dialog.component.html',
  styleUrl: './news-details-dialog.component.css'
})
export class NewsDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log("Dialog data", data)
  }

// In your component class
  myEncodeURIComponent(text: string): string {
    return encodeURIComponent(text);
  }

}
