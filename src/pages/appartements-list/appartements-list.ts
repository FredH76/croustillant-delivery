import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController
} from "ionic-angular";
import { OrderProvider, Customer } from "../../providers/order/order";

@IonicPage()
@Component({
  selector: "page-appartements-list",
  templateUrl: "appartements-list.html"
})
export class AppartementsListPage {
  public building: any;
  public customers: Array<Customer> = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: any,
    public modalCtrl: ModalController
  ) {
    this.building = this.os.orders.addresses[this.addresseIndex].buildings[
      this.buildingIndex
    ];

    this.customers = os.orders.addresses[this.addresseIndex].buildings[
      this.buildingIndex
    ].customers.sort((a, b) => {
      return parseInt(a.floor) - parseInt(b.floor);
    });

    if (this.building.hasElevator == true) {
      this.customers = this.customers.reverse();
    }
  }

  get addresseIndex() {
    return this.navParams.get("addresseIndex") || 0;
  }
  get buildingIndex() {
    return this.navParams.get("buildingIndex") || 0;
  }

  problem() {
    const modal = this.modalCtrl.create("NotesPage", {
      notes: this.building.notes
    });
    modal.present();
    modal.onDidDismiss(data => {
      if (data) this.building.notes = "" + data.notes;
      this.os.validateAddress(this.addresseIndex);
    });
  }

  next(customerIndex) {
    const customer = this.os.orders.addresses[this.addresseIndex].buildings[
      this.buildingIndex
    ].customers[customerIndex];

    const data = {
      customerIndex: customerIndex,
      addresseIndex: this.addresseIndex,
      buildingIndex: this.buildingIndex
    };

    if (customer.isNew) this.navCtrl.push("OrderPage", data);
    else this.navCtrl.push("ScannerPage", data);
  }
}
