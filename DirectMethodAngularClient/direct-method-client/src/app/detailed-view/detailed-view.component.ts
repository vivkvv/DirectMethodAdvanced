import { Component, OnInit } from '@angular/core';
import { DesktopSplitterService } from '../services/desktop-splitter.service';

@Component({
    selector: 'app-detailed-view',
    templateUrl: './detailed-view.component.html',
    styleUrls: ['./detailed-view.component.css'],
})
export class DetailedViewComponent implements OnInit {
    mainContentSize: number = 75;
    tabsContentSize: number = 25;

    constructor(public desktopSplitter: DesktopSplitterService) {}

    ngOnInit() {
        this.updateLayout(window.innerWidth);
        window.onresize = () => this.updateLayout(window.innerWidth);
    }

    private updateLayout(width: number) {
      const { mainSize, tabSize } = this.desktopSplitter.calculateSplitterSizes(width);
      this.mainContentSize = mainSize;
      this.tabsContentSize = tabSize;    }
}
