import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './feature/about/about.component';
import { HomeComponent } from './feature/home/home.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { AuthComponent } from './auth/auth.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
