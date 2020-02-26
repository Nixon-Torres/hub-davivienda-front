import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
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
        path: '404',
        loadChildren: './pages/public/not-found/not-found.module#NotFoundModule'
    },
    {
        path: 'app',
        canLoad: [AuthGuard],
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
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
            },
            {
                path: 'notifications',
                loadChildren: './pages/private/notifications/notifications.module#NotificationsModule'
            },
            {
                path: 'users',
                loadChildren: './pages/private/users/users.module#UsersModule'
            },            
            {
                path: '404',
                loadChildren: './pages/public/not-found/not-found.module#NotFoundModule'
            },
            {
                path: '**',
                redirectTo: '/app/404'
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/404'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
