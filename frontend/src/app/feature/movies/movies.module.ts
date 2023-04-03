import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MoviesComponent } from './movies.component';
import { PopularComponent } from './popular/popular.component';

@NgModule({
  declarations: [MoviesComponent, PopularComponent],
  imports: [CommonModule, RouterModule, SharedModule],
  providers: [],
  exports: [MoviesComponent],
})
export class MoviesModule {}
