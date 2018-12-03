import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import Mapboxgl from 'mapbox-gl';
import * as MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { BackgroundMode } from '@ionic-native/background-mode';
import { OrderProvider } from '../../providers/order/order';

@IonicPage()
@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html',
})
export class NavigationPage {

  hasBeenComputed: boolean;
  destination: {
    lng: number,
    lat: number
  };

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private launchNavigator: LaunchNavigator,
    private alertCtrl: AlertController,
    private backgroundMode: BackgroundMode,
    private platform: Platform,
    private os: OrderProvider
  ) {
    this.hasBeenComputed = false;
    this.destination = this.navParams.get("destination");
  }

  ionViewDidLoad() {
    if (!this.destination) {
      this.alertCtrl.create({
        title: 'Oups!',
        message: 'Pas de coordonnées fournies, impossible d\'afficher la carte',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.navCtrl.pop();
            }
          }
        ]
      }).present();
    }
    Mapboxgl.accessToken = this.os.loggedInfo.mapboxApiKey;
    const map = new Mapboxgl.Map({
      container: 'map-directions',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [this.destination.lng, this.destination.lat],
      zoom: 12
    });
    const directions = new MapboxDirections({
      accessToken: Mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/cycling',
      controls: {
        inputs: false,
        instructions: false,
        profileSwitcher: true
      },
      interactive: false
    });
    map.addControl(directions);

    const geoCtrl = new Mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    map.addControl(geoCtrl);

    const self = this;
    map.on('error', (error) => {
      console.log('Erreur de chargement de la carte', error.message);
    })
    map.on('load', () => {
      geoCtrl.on('geolocate', function (e) {

        if (self.hasBeenComputed === false) {
          directions.setOrigin([e.coords.longitude, e.coords.latitude]);
          directions.setDestination([self.destination.lng, self.destination.lat]);
          self.hasBeenComputed = true;
        }
      });
      geoCtrl.on('locationerror', function () {
        console.log('Position could not be found');
        alert('impossible de déterminer la position GPS');
      });
      geoCtrl.trigger();
    })

    directions.on('origin', (feature) => {
      console.log('origin', feature);
    });
    directions.on('destination', (feature) => {
      console.log('destination', feature);
    });
    directions.on('route', (route) => {
      console.log('route', route);
    });
    directions.on('error', (error) => {
      console.log('error', error);
    });
    directions.on('loading', (type) => {
      console.log('loading', type);
    });
    directions.on('profile', (profile) => {
      console.log('profile', profile);
    });
    this.setupBgMode();
  }

  ionViewWillUnload() {
    if (!this.platform.is("cordova")) return;
    this.backgroundMode.disable();
  }

  setupBgMode() {
    if (!this.platform.is("cordova")) return;
    this.backgroundMode.on('enable').subscribe(() => {
      console.log('Background mode enabled');
    });
    this.backgroundMode.on('disable').subscribe(() => {
      console.log('Background mode disabled');
    });
    this.backgroundMode.on('deactivate').subscribe(() => {
      console.log('Background mode deactivated');
    });
    this.backgroundMode.on('activate').subscribe(() => {
      console.log('Background mode activated');
    });
    this.backgroundMode.enable();
  }

  nav() {
    this.launchNavigator.navigate([this.destination.lat, this.destination.lng], {
      transportMode: 'bicycling',
      successCallback: () => {
        this.navCtrl.pop();
      },
      errorCallback: () => {
        this.alertCtrl.create({
          title: 'Oups!',
          message: 'Impossible de lancer le guidage',
          buttons: [
            {
              text: 'OK'
            }
          ]
        }).present();
      }
    }).then(() => {
      this.navCtrl.pop();
    }).catch(err => {
      this.alertCtrl.create({
        title: 'Oups!',
        message: 'Impossible d\'ouvrir l\'appli de guidage',
        buttons: [
          {
            text: 'OK'
          }
        ]
      }).present();
    });
  }
}

