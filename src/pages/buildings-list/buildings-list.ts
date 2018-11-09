import { Component, Pipe, PipeTransform } from "@angular/core";
import { IonicPage, NavController, NavParams, LoadingController, ToastController, Loading } from "ionic-angular";
import { OrderProvider, Building, Customer } from "../../providers/order/order";
import { ParklinkProvider } from "../../providers/parklink/parklink";
import chameleon from '../../../plugins/cordova-plugin-chameleon/www/chameleon';

@IonicPage()
@Component({
  selector: "page-buildings-list",
  templateUrl: "buildings-list.html"
})
export class BuildingsListPage {
  public mode = "1";
  public customers: Array<Customer> = [];
  public hasBadge: boolean = false;
  public badgeID: string = "";
  public badgeTYPE: string = "";
  public loading: Loading;
  badgeArray: Uint8Array;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    public pk: ParklinkProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController

  ) {
    this.os.orders.addresses[this.addresseIndex].buildings.forEach(build => {
      build.customers.forEach(cust => {
        this.customers.push(cust);
        cust.order.deliveredTime;
        cust.notes;
      });

      // Merge information about building badges (since these informations are duplicated for each buildings)
      // and store badge type
      if (build.hasBadge) {
        this.hasBadge = true;

        if (build.rebadgeID) {
          this.badgeID = build.rebadgeID;
          this.badgeTYPE = "REBADGE";
        }

        if (build.duplibadgeID) {
          this.badgeID = build.duplibadgeID;
          this.badgeTYPE = "DUPLIBADGE";
        }

        // TODO : REMOVE THIS TEMPORARY DATA (when available from backend) 
        this.badgeID = "9268-7E00-846E";
        this.badgeTYPE = "REBADGE";
      }
    });
  }

  get addresseIndex(): number {
    return this.navParams.get("addresseIndex") || 0;
  }

  next(id) {
    this.navCtrl.push("AppartementsListPage", {
      addresseIndex: this.addresseIndex,
      buildingIndex: id
    });
  }

  /**
   * DOWNLOAD BADGE FROM PARKLINK
   * (set a promise to allow chaining functions if needed)
   * 
   * @param badgeID : badge id in XXXX-XXXX-XXXX or XXXXXXXXXXXX format
   * @param badgeTYPE : badge type (REBADGE or DUPLIBADGE)
   */
  downloadBadge(badgeID, badgeTYPE) {
    return new Promise((resolve, reject) => {

      // test data availability
      if (!badgeID || !badgeTYPE) {
        let errMsg: string = "Echec Téléchargement. Il manque le badge ID et/ou son type";
        this.presentToastError(errMsg);
        reject(errMsg);
        return;
      }

      // display a spinner
      this.startLoading();

      // download badge array from parklink
      this.pk.downloadBadge(badgeID, badgeTYPE).then(
        (badge: Uint8Array) => {
          this.badgeArray = badge;
          this.stopLoading();
          this.presentToastSuccess("Téléchargement réussit");
          resolve();
        },
        (err) => {
          this.stopLoading();
          this.presentToastError("Echec Téléchargement: " + err.msg);
          reject(err);
        }
      );
    });
  }

  /**
   * TRANSFER BADGE FROM APP TO CHAMELEON
   * 
   * @param badgeArray : badge array in Uint8Array format
   */
  transferBadge(badge) {

    // test presence of USB
    chameleon.isPresent(
      null,
      success => console.log("USB IS CONNECTED " + success),
      error => console.log("USB NOT CONNECTED " + error)
    )

    // initialize USB

    // send badge

    // close USB

  }


  presentToastSuccess(msg?: string) {
    let toast = this.toastCtrl.create({
      message: msg || "Ok",
      position: "top",
      cssClass: "toast valid",
      duration: 2000
    });
    toast.present();
  }

  presentToastError(error?: string) {
    let toast = this.toastCtrl.create({
      message: error || "Ooops, une erreur est survenue.",
      position: "top",
      showCloseButton: true,
      cssClass: "toast error",
      closeButtonText: "Fermer"
    });
    toast.present();
  }

  stopLoading() {
    this.loading.dismiss();
  }

  startLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: "dots",
      dismissOnPageChange: true
    });
    this.loading.present();
  }
}

@Pipe({ name: "formatBoolean" })
export class FormatBooleanPipe implements PipeTransform {
  transform(val: boolean): string {
    if (val == true) return "oui";
    else if (val == false) return "non";
    else return null;
  }
}
