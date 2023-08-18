import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LessonComponent } from './lesson/lesson.component';
import { PartsListComponent } from './parts-list/parts-list.component';
import { OptionsPageComponent } from './options/options-page.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'Lesson/:part_id/:lesson_id', component: LessonComponent },
    { path: 'topic-list', component: PartsListComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'not-found', component: LoginComponent },
    { path: 'options', component: OptionsPageComponent},
    { path: '**', redirectTo: 'not-found' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
