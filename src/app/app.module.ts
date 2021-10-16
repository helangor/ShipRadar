import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShipDetailComponent } from './ship-detail/ship-detail.component';
import { ShipsComponent } from './ships/ships.component';

@NgModule({
  declarations: [
    AppComponent,
    ShipDetailComponent,
    ShipsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
