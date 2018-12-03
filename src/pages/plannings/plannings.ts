import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MapotempoProvider } from '../../providers/mapotempo/mapotempo';
import { OrderProvider } from '../../providers/order/order';
import { ParklinkProvider } from '../../providers/parklink/parklink';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@IonicPage()
@Component({
  selector: 'page-plannings',
  templateUrl: 'plannings.html',
})
export class PlanningsPage {
  plannings: any;
  lastExport: any;
  isLastExportLoading: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    public mapotempo: MapotempoProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.isLastExportLoading = false;
  }

  ionViewDidLoad() {
    this.mapotempo.getPlannings().then(res => {
      this.plannings = res;
      if (this.plannings && this.plannings[0]) {
        this.selectPlanning(this.plannings[0]);
      }
    }).catch(err => {
      console.log("Impossible de charger les plannings.", err);
    });
    this.getLastExport();
  }

  getLastExport() {
    this.isLastExportLoading = true;
    this.mapotempo.getLastExport().then(lastExport => {
      this.lastExport = lastExport;
      this.isLastExportLoading = false;
    }).catch(err => {
      this.isLastExportLoading = false;
      console.log("Impossible de charger les données sur le dernier export.", err);
    });
  }

  exportToMapotempo() {
    this.alertCtrl.create({
      title: "Export Mapotempo",
      message: "Voulez-vous forcer un export des commandes vers Mapotempo (tous les plans existants seront écrasés)?",
      buttons: [{
        text: "Annuler",
        role: "cancel"
      }, {
        text: "Exporter",
        handler: () => {
          const loader = this.loadingCtrl.create({
            content: 'Export en cours'
          });
          loader.present();
          this.mapotempo.exportPlanningsToMapotempo().then(lastExport => {
            loader.dismiss();
            this.getLastExport();
            this.toastCtrl.create({
              message: 'Export terminé dans Mapotempo',
              showCloseButton: true,
              duration: 3000
            }).present();
          }).catch(err => {
            console.log("Impossible d'exporter les données vers Mapotempo'.", err);
            loader.dismiss();
            this.toastCtrl.create({
              message: 'Impossible d\'exporter les données vers Mapotempo',
              showCloseButton: true
            }).present();
          });
        }
      }]
    }).present();

  }

  selectPlanning(planning) {
    this.os.zoneId = 1;
    this.os.date = planning.date;
    this.navCtrl.push("RoutesPage", { planning });
  }

  logout() {
    this.os.logOut().then(() => {
      location.reload();
    });
  }

}
