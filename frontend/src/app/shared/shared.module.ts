import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { MovieCardComponent } from './components/movie-card/movie-card.component';
import { ClickOutsideDirective } from './directives/clickOutside.directive';
import { PaginationComponent } from './components/pagination/pagination.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [
    ClickOutsideDirective,
    DropdownComponent,
    MovieCardComponent,
    PaginationComponent,
  ],
  exports: [
    ClickOutsideDirective,
    CommonModule,
    DropdownComponent,
    MovieCardComponent,
    PaginationComponent,
  ],
})
export class SharedModule {}
