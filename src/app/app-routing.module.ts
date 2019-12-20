import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/app/principal',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './pages/public/login/login.module#LoginModule'
  },
  {
    path: 'forgot-password',
    loadChildren: './pages/public/forgot-password/forgot-password.module#ForgotPasswordModule'
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/app/principal',
        pathMatch: 'full'
      },
      {
        path: 'principal',
        loadChildren: './pages/private/principal/principal.module#PrincipalModule'
      },
      {
        path: 'board',
        loadChildren: './pages/private/board/board.module#BoardModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
