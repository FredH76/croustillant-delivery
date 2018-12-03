import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { Customer, OrderProvider } from "../../providers/order/order";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { ViewController } from "ionic-angular/navigation/view-controller";

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
    public platform: Platform,
    private barcodeScanner: BarcodeScanner,
    private viewCtrl: ViewController
  ) {
    this.scan();
    this.customer = this.navParams.get("customer");
  }

  scan() {
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
    this.viewCtrl.dismiss({
      ...this.navParams.data,
      mustValidate: true
    });
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}
