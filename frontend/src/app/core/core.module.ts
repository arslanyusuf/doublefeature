import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [HeaderComponent, FooterComponent],
  imports: [BrowserModule, SharedModule],
  providers: [],
  exports: [HeaderComponent, FooterComponent],
})
export class CoreModule {}
