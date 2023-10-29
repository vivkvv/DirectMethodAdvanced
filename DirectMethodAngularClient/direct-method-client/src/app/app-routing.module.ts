import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LessonComponent } from './lesson/lesson.component';
import { PartsListComponent } from './parts-list/parts-list.component';
import { ClientPartsListComponent } from './client-parts-list/client-parts-list.component';
import { OptionsPageComponent } from './options/options-page.component';
import { AuthorizationCheckingComponent } from './authorization-checking/authorization-checking.component';
import { RegisterComponent } from './registering/registering.component';
import { ExitComponent } from './exit/exit.component';
import { DeleteModeComponent } from './delete-mode/delete-mode.component';
import { QuickLinksComponent } from './quick-links/quick-links';
import { FilesComponent } from './files/files.component';
// import { PreAuthorizationCheckingComponent } from './pre-authorization-checking/pre-authorization-checking.components';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'quick-links', component: QuickLinksComponent},
    { path: 'Lesson/:part_id/:lesson_id', component: LessonComponent },
    { path: 'topic-list', component: PartsListComponent },
    { path: 'client-topic-list', component: ClientPartsListComponent },    
    { path: 'files', component: FilesComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'not-found-angular', component: LoginComponent },
    { path: 'options', component: OptionsPageComponent },
    { path: 'exit', component: ExitComponent },
    { path: 'delete-mode', component: DeleteModeComponent },
    {
        path: 'authorization-checking',
        component: AuthorizationCheckingComponent,
    },
    { path: 'test.html', component: AuthorizationCheckingComponent },
    // { path: 'pre-authorization-checking', component: PreAuthorizationCheckingComponent },
    { path: '**', redirectTo: 'not-found-angular' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
