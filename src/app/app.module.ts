import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ProgressBarModule } from 'angular-progress-bar';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DragNDropComponent } from './drag-n-drop/drag-n-drop.component';
import {ContactComponent} from './email/contact.component';
import { AppNavComponent } from './shared/app-nav/app-nav.component';
import {HeaderComponent} from './shared/header/header.component';
import {HeroComponent} from './shared/hero/hero.component';
import {FooterComponent} from './shared/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    DragNDropComponent,
    ContactComponent,
    AppNavComponent,
    HeaderComponent,
    HeroComponent,
    FooterComponent,
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
