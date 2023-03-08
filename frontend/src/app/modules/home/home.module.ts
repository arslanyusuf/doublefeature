import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [AppRoutingModule, BrowserModule],
  providers: [],
  exports: [HomeComponent],
})
export class HomeModule {}
