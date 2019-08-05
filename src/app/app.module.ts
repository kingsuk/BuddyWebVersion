import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  SpeechSynthesisModule,
} from '@kamiazya/ngx-speech-synthesis';

import {WebcamModule} from 'ngx-webcam';
import { CameraComponent } from './camera/camera.component';
import { MasterUiComponent } from './master-ui/master-ui.component';

@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    MasterUiComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WebcamModule,
    HttpClientModule,
    SpeechSynthesisModule.forRoot({
      lang: 'en',
      volume: 1.0,
      pitch: 1.0,
      rate: 1.0,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
