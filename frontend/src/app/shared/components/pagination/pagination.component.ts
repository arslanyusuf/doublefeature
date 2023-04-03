import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input() routerLinkBase = '';
  @Input() limit: number = 0;
  @Input() max: number = 0;

  public page = 1;
  public totalPages = 5;
  public next = '';
  public previous = '';

  ngOnInit() {
    if (this.page === 1) {
      this.next = 'cursor-not-allowed';
    } else if (this.page === this.totalPages) {
      this.previous = 'cursor-not-allowed';
    }
  }
}
