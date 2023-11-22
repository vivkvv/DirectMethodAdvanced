import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesktopSplitterService {
  private readonly mainContentDefaultWidth: number = 600;

  constructor() {}

  calculateSplitterSizes(width: number): { mainSize: number, tabSize: number } {
    let mainSize = 100;
    let tabSize = 0;

    if (this.isDesktop()) {
      const mainContentWidthPx = Math.min(this.mainContentDefaultWidth, width);
      mainSize = (mainContentWidthPx / width) * 100;
      tabSize = 100 - mainSize;
    }

    return { mainSize, tabSize };
  }

  isDesktop(): boolean {
    return window.innerWidth > this.mainContentDefaultWidth;
  }
}
