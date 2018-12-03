import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { MyApp } from "./app.component";
import { OrderProvider } from "../providers/order/order";

import { HttpClientModule } from "@angular/common/http";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { IonicStorageModule } from "@ionic/storage";
import { ParklinkProvider } from '../providers/parklink/parklink';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { BackgroundMode } from '@ionic-native/background-mode';
import { MapotempoProvider } from '../providers/mapotempo/mapotempo';

@NgModule({
  declarations: [MyApp],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: "Retour",
      monthNames: [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
      ]
    }),
    HttpClientModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    OrderProvider,
    BarcodeScanner,
    ParklinkProvider,
    LaunchNavigator,
    BackgroundMode,
    MapotempoProvider
  ]
})
export class AppModule { }
