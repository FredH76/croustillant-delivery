import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { Customer, OrderProvider } from "../../providers/order/order";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";

@IonicPage()
@Component({
  selector: "page-scanner",
  templateUrl: "scanner.html"
})
export class ScannerPage {
  public error: string;
  public error2: string;
  public customer: Customer;
  public input_id: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    public platform: Platform,
    private barcodeScanner: BarcodeScanner
  ) {
    this.scan();

    this.customer = this.os.orders.addresses[this.addresseIndex].buildings[
      this.buildingIndex
    ].customers[this.customerIndex];
  }

  get addresseIndex() {
    return this.navParams.get("addresseIndex");
  }
  get customerIndex() {
    return this.navParams.get("customerIndex");
  }

  get buildingIndex() {
    return this.navParams.get("buildingIndex");
  }

  scan() {
    // if (!this.platform.is("cordova")) return;
    this.barcodeScanner
      .scan()
      .then(res => {
        console.log(res);
        if (res.cancelled == false) {
          if (res.text == this.customer.id) this.next();
          else this.error = `Id incorrect (reçu : "${res.text}")`;
        }
      })
      .catch(err => {
        this.error = `erreur : ${err}`;
      });
  }

  add() {
    if (this.input_id == this.customer.id) this.next();
    else this.error2 = `Incorrect`;
  }

  next() {
    this.navCtrl.push("OrderPage", {
      ...this.navParams.data,
      fromScanner: true
    });
  }
}
