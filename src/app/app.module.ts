import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ProgressBarModule } from 'angular-progress-bar';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DragNDropComponent } from './drag-n-drop/drag-n-drop.component';
import {ContactComponent} from './email/contact.component';

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
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
