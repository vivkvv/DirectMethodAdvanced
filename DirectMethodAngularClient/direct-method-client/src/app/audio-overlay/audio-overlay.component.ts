import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'audio-overlay-content',
  templateUrl: './audio-overlay.component.html',
  styleUrls: ['./audio-overlay.component.css']
})
export class AudioOverlayComponent {
  constructor(public dialogRef: MatDialogRef<AudioOverlayComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
