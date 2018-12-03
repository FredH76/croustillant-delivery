import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MapotempoProvider } from '../../providers/mapotempo/mapotempo';
import { OrderProvider } from '../../providers/order/order';

@IonicPage()
@Component({
  selector: 'page-routes',
  templateUrl: 'routes.html',
})
export class RoutesPage {

  planning: any;
  routes: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    public mapotempo: MapotempoProvider
  ) {
    this.planning = this.navParams.get("planning");
  }

  ionViewDidLoad() {
    this.mapotempo.getRoutes(this.planning.id).then(res => {
      this.routes = res;
    }).catch(err => {
      console.log("Impossible de charger les plannings.");
    });
  }

  selectRoute(route) {
    this.os.zoneId = 1;
    this.os.date = this.planning.date;
    this.navCtrl.setRoot("AddressesListPage", { route }, {
      animate: true,
      animation: "push",
      direction: "forward"
    });
  }

}
