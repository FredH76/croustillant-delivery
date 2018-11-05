import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController
} from "ionic-angular";
import { OrderProvider, Address, Building } from "../../providers/order/order";

@IonicPage()
@Component({
  selector: "page-addresses-list",
  templateUrl: "addresses-list.html"
})
export class AddressesListPage {
  public addresses;
  public mode = "1";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    private alertCtrl: AlertController
  ) {
    this.init();
  }

  init() {
    this.os.startLoading();
    this.os.getOrders().then(() => {
      this.addresses = this.os.orders.addresses;
      this.os.stopLoading();
    });
  }

  reorderItems(indexes) {
    let element = this.os.orders.addresses[indexes.from];
    this.os.orders.addresses.splice(indexes.from, 1);
    this.os.orders.addresses.splice(indexes.to, 0, element);
  }

  next(index) {
    this.navCtrl.push("BuildingsListPage", { addresseIndex: index });
  }

  quit() {
    let alert = this.alertCtrl.create({
      title: "Abandonner livraison ?",
      buttons: [
        {
          text: "Annuler",
          role: "cancel",
          handler: () => {}
        },
        {
          text: "Confirmer",
          handler: () => {
            this.navCtrl.setRoot("DeliveryZonesPage").then(() => {
              location.reload();
            });
          }
        }
      ]
    });
    alert.present();
  }

  done() {
    let alert = this.alertCtrl.create({
      title: "Synchroniser livraison ?",
      buttons: [
        {
          text: "Annuler",
          role: "cancel",
          handler: () => {}
        },
        {
          text: "Confirmer",
          handler: () => {
            this.os.startLoading();
            this.os
              .submit()
              .then(() => {
                this.os.presentToastSuccess("Synchronisé !");
                setTimeout(() => {
                  this.navCtrl.setRoot("DeliveryZonesPage").then(() => {
                    this.os.stopLoading();
                    location.reload();
                  });
                }, 1000);
              })
              .catch(err => {
                this.os.stopLoading();
                this.os.presentToastError(err);
              });
          }
        }
      ]
    });
    alert.present();
  }
}
