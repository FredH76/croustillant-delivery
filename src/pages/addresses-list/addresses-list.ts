import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController
} from "ionic-angular";
import { OrderProvider, Address } from "../../providers/order/order";
import { MapotempoProvider } from "../../providers/mapotempo/mapotempo";

@IonicPage()
@Component({
  selector: "page-addresses-list",
  templateUrl: "addresses-list.html"
})
export class AddressesListPage {
  public addresses;
  public mode = "1";
  public route;
  public rawOrders: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    private alertCtrl: AlertController,
    private mapotempo: MapotempoProvider
  ) {
    this.route = this.navParams.get("route");
  }



  next(stop: any) {
    if (!stop.foundOrder) return;
    this.navCtrl.push("OrderPage", { stop });
  }

  quit() {
    let alert = this.alertCtrl.create({
      title: "Abandonner livraison ?",
      buttons: [
        {
          text: "Annuler",
          role: "cancel",
          handler: () => { }
        },
        {
          text: "Confirmer",
          handler: () => {
            this.navCtrl.setRoot("PlanningsPage").then(() => {
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
          handler: () => { }
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
                  this.navCtrl.setRoot("PlanningsPage").then(() => {
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
