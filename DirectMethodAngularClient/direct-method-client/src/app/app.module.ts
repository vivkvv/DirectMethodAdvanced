import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EntityBlockComponent } from './entity-block/entity-block.component';
import { LoginComponent } from './login/login.component';

import { ReactiveFormsModule } from '@angular/forms';
import { LessonComponent } from './lesson/lesson.component';
import { PartsListComponent } from './parts-list/parts-list.component';
import { ClientPartsListComponent } from './client-parts-list/client-parts-list.component';

import { AuthInterceptor } from './services/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { OAuthModule } from 'angular-oauth2-oidc';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';

import { AudioOverlayComponent } from './audio-overlay/audio-overlay.component';
import { FontGroupComponent } from './options/font-group/font-group.component';
import { OptionsPageComponent } from './options/options-page.component';
import { AuthorizationCheckingComponent } from './authorization-checking/authorization-checking.component';
import { PreAuthorizationCheckingComponent } from './pre-authorization-checking/pre-authorization-checking.components';
import { DigitalStudentsGroupComponent } from './options/digital-students-group/digital-students-group.component';
import { OnRealStudentAnswerGroupComponent } from './options/on-real-student-answer-group/on-real-student-answer-group';
import { RegisterComponent } from './registering/registering.component';
import { RouterModule } from '@angular/router';
import { ExitComponent } from './exit/exit.component';
import { DeleteModeComponent } from './delete-mode/delete-mode.component';
import { UserService } from './services/UserService/user.service';
import { QuickLinksComponent } from './quick-links/quick-links';
import { FilesComponent } from './files/files.component';
import { ClientTopicListComponent } from './client-topic-list/client-topic-list';
import { AngularSplitModule } from 'angular-split';
import { DetailedViewComponent } from './detailed-view/detailed-view.component';
import { SpeechRecognitionTreeComponent } from './speech-recognition-tree/speech-recognition-tree.component';

@NgModule({
    declarations: [
        AppComponent,
        EntityBlockComponent,
        LoginComponent,
        FilesComponent,
        RegisterComponent,
        QuickLinksComponent,
        LessonComponent,
        PartsListComponent,
        ClientTopicListComponent,
        ClientPartsListComponent,
        FontGroupComponent,
        DigitalStudentsGroupComponent,
        OnRealStudentAnswerGroupComponent,
        OptionsPageComponent,
        AuthorizationCheckingComponent,
        PreAuthorizationCheckingComponent,
        ExitComponent,
        DeleteModeComponent,
        AudioOverlayComponent,
        DetailedViewComponent,
        SpeechRecognitionTreeComponent,
    ],
    imports: [
        MatTreeModule,
        MatSliderModule,
        FormsModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatDialogModule,
        MatTabsModule,
        CommonModule,
        RouterModule,
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        HttpClientModule,
        OAuthModule.forRoot(),
        BrowserAnimationsModule,
        AngularSplitModule,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        UserService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
