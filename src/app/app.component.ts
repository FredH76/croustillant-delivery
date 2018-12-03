import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { OrderProvider } from "../providers/order/order";
import { MapotempoProvider } from "../providers/mapotempo/mapotempo";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage: any;
  // rootPage: any = "DeliveryZonesPage";
  // rootPage: any = "AddressesListPage";

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    os: OrderProvider,
    mapotempo: MapotempoProvider
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();

      os
        .init()
        .then(() => {
          return mapotempo.init();
        }).then(() => {
          this.rootPage = "PlanningsPage";
          splashScreen.hide();
        })
        .catch(err => {
          this.rootPage = "LoginPage";
          splashScreen.hide();
          console.log("error", err);
        });
    });
  }
}
