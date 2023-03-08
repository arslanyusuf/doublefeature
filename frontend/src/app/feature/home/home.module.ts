import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [AppRoutingModule, CommonModule],
  providers: [],
  exports: [HomeComponent],
})
export class HomeModule {}
