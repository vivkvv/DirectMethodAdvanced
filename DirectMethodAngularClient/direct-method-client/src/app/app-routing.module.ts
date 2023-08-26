import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LessonComponent } from './lesson/lesson.component';
import { PartsListComponent } from './parts-list/parts-list.component';
import { OptionsPageComponent } from './options/options-page.component';
import { AuthorizationCheckingComponent } from './authorization-checking/authorization-checking.component';
// import { PreAuthorizationCheckingComponent } from './pre-authorization-checking/pre-authorization-checking.components';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'Lesson/:part_id/:lesson_id', component: LessonComponent },
    { path: 'topic-list', component: PartsListComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'not-found', component: LoginComponent },
    { path: 'options', component: OptionsPageComponent },
    {
        path: 'authorization-checking',
        component: AuthorizationCheckingComponent,
    },
    { path: 'test.html', component: AuthorizationCheckingComponent },
    // { path: 'pre-authorization-checking', component: PreAuthorizationCheckingComponent },
    { path: '**', redirectTo: 'not-found' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
