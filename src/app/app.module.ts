import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GoogleMapsModule } from '@angular/google-maps';
import {MatCardModule} from '@angular/material/card';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShipDetailComponent } from './ship-detail/ship-detail.component';
import { ShipsComponent } from './ships/ships.component';
import { MapsComponent } from './maps/maps.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { InfoPageComponent } from './info-page/info-page.component';
import {MatButtonModule} from '@angular/material/button';

const appRoutes: Routes = [
  { path: '', component: ShipsComponent },
  { path: 'info', component: InfoPageComponent}
];


@NgModule({
  declarations: [
    AppComponent,
    ShipDetailComponent,
    ShipsComponent,
    MapsComponent,
    ShipsComponent,
    InfoPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
    ),
    AppRoutingModule,
    FlexLayoutModule,
    GoogleMapsModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
