import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { OrderProvider } from "../../providers/order/order";

@IonicPage()
@Component({
  selector: "page-delivery-zones",
  templateUrl: "delivery-zones.html"
})
export class DeliveryZonesPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider
  ) {}

  selectZone(id) {
    this.os.zoneId = id;
    this.navCtrl.push("DatePage");
  }

  logout() {
    this.os.logOut().then(() => {
      location.reload();
    });
  }
}
