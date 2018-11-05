import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController
} from "ionic-angular";
import { Customer, OrderProvider } from "../../providers/order/order";

@IonicPage()
@Component({
  selector: "page-order",
  templateUrl: "order.html"
})
export class OrderPage {
  order: {
    id: string;
    products: Array<{ productId: string; name: string; quantity: number }>;
  };
  public customer: Customer;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public os: OrderProvider
  ) {
    this.customer = this.os.orders.addresses[this.addresseIndex].buildings[
      this.buildingIndex
    ].customers[this.customerIndex];
    this.order = this.customer.order;

    if (this.navParams.get("fromScanner"))
      this.navCtrl.remove(this.navCtrl.indexOf(this.navCtrl.getActive()), 1);
  }

  get addresseIndex() {
    return this.navParams.get("addresseIndex") || 0;
  }
  get customerIndex() {
    return this.navParams.get("customerIndex") || 0;
  }

  get buildingIndex() {
    return this.navParams.get("buildingIndex") || 0;
  }

  problem() {
    const modal = this.modalCtrl.create("NotesPage", {
      notes: this.customer.notes
    });
    modal.present();
    modal.onDidDismiss(data => {
      if (data) this.customer.notes = data.notes;
      this.os.calculateStatus(this.addresseIndex, this.buildingIndex);
    });
  }

  add() {
    this.customer.order.deliveredTime = new Date();
    this.os.calculateStatus(this.addresseIndex, this.buildingIndex);
    this.os.updateTotalDelivered();
    this.navCtrl.pop();
  }
}
