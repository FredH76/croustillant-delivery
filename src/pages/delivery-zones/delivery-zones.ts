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
  testResult: string;

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

  /* FOR TEMPORARY TEST PURPOSE. TO BE DELETED 
  public testUSBpresent() {
    console.log("Test USB PRESENT clicked");
    chameleon.isPresent(null, suc => this.successUSB(suc), err => this.errorUSB(err));
  }

  public testUSBinitialize() {
    console.log("Test USB INITIALIZE clicked");
    chameleon.initialize(null, suc => this.successUSB(suc), err => this.errorUSB(err));
  }

  public testUSBuploadArray() {
    console.log("Test USB UPLOAD ARRAY clicked");
    let badgeID = "9268-7E00-846E";
    let badgeTYPE = "REBADGE";
    this.pk.downloadBadge(badgeID, badgeTYPE).then(
      badgeArray => chameleon.uploadArray(badgeArray, suc => this.successUSB(suc), err => this.errorUSB(err)),
      err => this.errorUSB(err)
    );
  }

  public testUSBshutdown() {
    console.log("Test USB SHUTDOWN clicked");
    chameleon.shutdown(null, suc => this.successUSB(suc), err => this.errorUSB(err));
  }

  public testDownload() {
    console.log("Test DOWNLOAD clicked");
    this.pk.downloadBadge("92687E00846E", "DUPLIBADGE").then(
      data => console.log("SUCCESS : " + data),
      data => console.log("ERROR : " + data),
    );
  }

  public successUSB(msg) {
    this.testResult = msg;
    console.debug(msg);
  }

  public errorUSB(msg) {
    this.testResult = msg;
    console.error(msg);
  }
  */ // END OF TEST
}
