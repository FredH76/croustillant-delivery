import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import Mapboxgl from 'mapbox-gl';
import { MapotempoProvider, MapotempoStop } from '../../providers/mapotempo/mapotempo';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { OrderProvider } from '../../providers/order/order';
import chameleon from '../../../plugins/cordova-plugin-chameleon/www/chameleon';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { ParklinkProvider } from '../../providers/parklink/parklink';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Loading } from 'ionic-angular/components/loading/loading';

@IonicPage()
@Component({
  selector: 'page-order',
  templateUrl: 'order.html',
})
export class OrderPage {

  stop: MapotempoStop;
  loading: Loading;
  badgeArray: Uint8Array;
  public hasBadge: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private mapotempo: MapotempoProvider,
    private modalCtrl: ModalController,
    private os: OrderProvider,
    private toastCtrl: ToastController,
    private pk: ParklinkProvider,
    private loadingCtrl: LoadingController
  ) {
    this.stop = this.navParams.get('stop');
    if (this.navParams.get("fromScanner")) {
      this.navCtrl.remove(this.navCtrl.indexOf(this.navCtrl.getActive()), 1);
    }
  }

  ionViewDidLoad() {
    Mapboxgl.accessToken = this.os.loggedInfo.mapboxApiKey;
    const map = new Mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [this.stop.destination.lng, this.stop.destination.lat],
      zoom: 13,
    });

    const self = this;
    map.on('load', () => {
      new Mapboxgl.Marker()
        .setLngLat([this.stop.destination.lng, this.stop.destination.lat])
        .addTo(map);
      map.setZoom(16);
    })
  }

  navigate() {
    this.navCtrl.push('NavigationPage', {
      destination: {
        lng: this.stop.destination.lng,
        lat: this.stop.destination.lat
      }
    })
  }

  problem() {
    const modal = this.modalCtrl.create("NotesPage", {
      notes: this.stop.order.customer.notes
    });
    modal.present();
    modal.onDidDismiss(data => {
      if (data) this.stop.order.customer.notes = "" + data.notes;
      this.os.calculateStatus(this.stop.order);
    });
  }

  add() {
    this.stop.order.deliveredTime = new Date().toISOString();
    this.os.calculateStatus(this.stop.order);
    this.os.updateTotalDelivered();
    this.navCtrl.pop();
  }

  scan() {
    const data = {
      customer: this.stop.order.customer
    };

    const modal = this.modalCtrl.create("ScannerPage", data);
    modal.onDidDismiss(data => {
      if (data && data.mustValidate) {
        this.add();
      }
    });
    modal.present();
  }


  /*************************************************************************************
   * LOAD BADGE on button click (from parklink to app to chameleon)
   ************************************************************************************/
  loadBadge() {
    // Step 1: download badge from parklink
    if (this.stop.order.address.hasBadge) {

      let badgeId, badgeType;

      if (this.stop.order.address.rebadgeID) {
        badgeId = this.stop.order.address.rebadgeID;
        badgeType = "REBADGE";
      }

      if (this.stop.order.address.duplibadgeID) {
        badgeId = this.stop.order.address.duplibadgeID;
        badgeType = "DUPLIBADGE";
      }

      if (badgeId && badgeType) {
        this.downloadBadgeArray(badgeId, badgeType).then(
          badgeArray => {
            // Step 2: transfer badgeArray into chameleon
            this.transferBadgeToCham();
          }
        ).catch(err => {
          console.log('downloadBadgeArray error', err);
        });
      }
    }
  }

  /**************************************************************************************
   * DOWNLOAD BADGE ARRAY from PARKLINK
   * (set a promise to allow chaining functions if needed)
   * 
   * @param badgeID : badge id in XXXX-XXXX-XXXX or XXXXXXXXXXXX format
   * @param badgeTYPE : badge type (REBADGE or DUPLIBADGE)
   *************************************************************************************/
  downloadBadgeArray(badgeID, badgeTYPE) {
    return new Promise((resolve, reject) => {

      // test data availability
      if (!badgeID || !badgeTYPE) {
        let errMsg: string = "Echec téléchargement. Il manque le badge ID et/ou son type";
        this.presentToastError(errMsg);
        reject(errMsg);
        return;
      }

      // display a spinner
      this.startLoading("Téléchargement du badge depuis parklink...");

      // download badge array from parklink
      this.pk.downloadBadge(badgeID, badgeTYPE).then(
        (badge: Uint8Array) => {
          this.badgeArray = badge;
          this.stopLoading();
          this.presentToastSuccess("Téléchargement réussi");
          resolve(badge);
        },
        (err) => {
          this.stopLoading();
          this.presentToastError("Echec Téléchargement: " + err.msg);
          reject(err);
        }
      );
    });
  }

  /**************************************************************************************
   * TRANSFER BADGE from APP to CHAMELEON
   *************************************************************************************/
  transferBadgeToCham() {
    // initialize USB driver
    chameleon.initialize(
      null,
      success => this.isPresent(),
      error => this.presentToastError("Le driver n'a pas pu être initialisé. Transfert annulé.")
    )
  }

  // test if usb is connected
  private isPresent() {
    chameleon.isPresent(
      null,
      success => this.sendBadge(),
      error => {
        this.presentToastError("Le Chameleon n'est pas connecté. Transfert annulé.");
        this.closeUSB();
      }
    )
  };

  // send badge (préviously dowloaded and stored in this.badgeArray)
  private sendBadge() {
    chameleon.uploadArray(
      this.badgeArray,
      success => {
        this.presentToastSuccess("Chargement du badge réussi");
        this.closeUSB()
      },
      error => {
        this.presentToastError("Le chargement n'a pu être effectué. Transfert annulé.");
        this.closeUSB();
      }
    )
  };

  // close USB
  private closeUSB() {
    chameleon.shutdown();
  }

  /**************************************************************************************
   * IHM functions for LOADING and MESSAGE display
   *************************************************************************************/
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

  startLoading(msg) {
    this.loading = this.loadingCtrl.create({
      spinner: "dots",
      dismissOnPageChange: true,
      content: msg
    });
    this.loading.present();
  }

}
