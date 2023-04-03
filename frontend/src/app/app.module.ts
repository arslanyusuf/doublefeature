import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './feature/home/home.module';
import { AboutModule } from './feature/about/about.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { MoviesModule } from './feature/movies/movies.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomeModule,
    CoreModule,
    RouterModule,
    AboutModule,
    AuthModule,
    MoviesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
