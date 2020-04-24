import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {ProgressBarModule} from 'angular-progress-bar';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {DragNDropComponent} from './drag-n-drop/drag-n-drop.component';
import {ContactComponent} from './email/contact.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {AppRoutingModule} from './app-routing.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';

@NgModule({
    declarations: [
        AppComponent,
        DragNDropComponent,
        ContactComponent
    ],
    imports: [
        BrowserModule,
        NgxDropzoneModule,
        ProgressBarModule,
        FormsModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        AppRoutingModule,
        MatProgressBarModule,
        MatCardModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
