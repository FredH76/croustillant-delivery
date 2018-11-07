import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { OrderProvider } from "../../providers/order/order";
import chameleon from '../../../plugins/cordova-plugin-chameleon/www/chameleon';
import { ParklinkProvider } from "../../providers/parklink/parklink";

@IonicPage()
@Component({
  selector: "page-delivery-zones",
  templateUrl: "delivery-zones.html"
})
export class DeliveryZonesPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    public pk: ParklinkProvider
  ) { }

  selectZone(id) {
    this.os.zoneId = id;
    this.navCtrl.push("DatePage");
  }

  logout() {
    this.os.logOut().then(() => {
      location.reload();
    });
  }


  public testUSB() {
    console.log("Test USB clicked");
    chameleon.coolMethod("hello", this.successUSB, this.errorUSB);
  }

  public testDownload() {
    console.log("Test DOWNLOAD clicked");
    this.pk.downloadBadge("92687E00846E", "DUPLIBADGE").then(
      data => console.log("SUCCESS : " + data),
      data => console.log("ERROR : " + data),
    );
  }

  public successUSB(msg) {
    //connectResult = "YES : USB CONNECTED !";
    console.debug(msg);
  }

  public errorUSB(msg) {
    //this.connectResult = "NO : USB NOT CONNECTED ..";
    console.error(msg);
  }
}
