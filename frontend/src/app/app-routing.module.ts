import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './feature/about/about.component';
import { HomeComponent } from './feature/home/home.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { AuthComponent } from './auth/auth.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { MoviesComponent } from './feature/movies/movies.component';
import { PopularComponent } from './feature/movies/popular/popular.component';
import { GenreComponent } from './feature/movies/genre/genre.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent, title: 'About - Double Feature' },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'sign-in',
        component: SignInComponent,
        title: 'Sign In - Double Feature',
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
        title: 'Sign Up - Double Feature',
      },
    ],
  },
  {
    path: 'movies',
    component: MoviesComponent,
    children: [
      {
        path: 'popular/:page',
        component: PopularComponent,
        title: 'Popular Movies - Double Feature',
      },
      {
        path: 'genre/:genre/:page',
        component: GenreComponent,
        title: 'Genres - Double Feature',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
