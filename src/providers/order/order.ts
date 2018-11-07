import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Storage } from "@ionic/Storage";
import {
  Platform,
  LoadingController,
  Loading,
  ToastController
} from "ionic-angular";
import { format } from "date-fns";
import { map } from "rxjs/operators";
//import { create } from "domain"; //removed by FRED H to prevent building errorsY

@Injectable()
export class OrderProvider {
  apiUrl: string;
  zones: any;
  zoneId: any;
  date = new Date().toISOString();
  sessionKey: any;
  public orders: Orders;
  public counter = {
    current: 0,
    total: 0
  };
  public generalInformations: {
    totalCustomer: number;
    totalNewCustomers: number;
    totalAddresses: number;
    totalProducts: Array<Product>;
    totalPrice: number;
  } = {
      totalCustomer: 0,
      totalNewCustomers: 0,
      totalAddresses: 0,
      totalProducts: [],
      totalPrice: 0
    };
  public loading: Loading;

  constructor(
    public http: HttpClient,
    private storage: Storage,
    public platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    // this.getOrders();

    // this.apiUrl = platform.is("cordova") ? "https://ps3.dev-ds.com/api" : "api";
    this.apiUrl = platform.is("cordova")
      ? "https://croustillant.com/api"
      : "api";
  }

  submit() {
    let report = "";
    let orders = [];
    this.orders.addresses.forEach(add => {
      add.buildings.forEach(build => {
        if (build.notes)
          report += "Building " + build.id + "\n" + build.notes + "\n\n";

        build.customers.forEach(cust => {
          if (cust.notes)
            report += "Client " + cust.id + "\n" + cust.notes + "\n\n";

          if (cust.order.deliveredTime) {
            orders.push({
              id: cust.order.id,
              date: cust.order.deliveredTime.toISOString()
            });
          }
        });
      });
    });
    console.log("report :");
    console.log(report);
    console.log("orders ", orders);

    return new Promise((resolve, reject) => {
      this.http
        .post<any>(this.apiUrl + "/employee/deliveryreport", {
          session_key: this.sessionKey,
          orders: orders,
          report: report
        })
        .subscribe(
          res => {
            console.log(res);
            if (res.result == "success") resolve();
            else reject(res.error);
          },
          err => reject(err)
        );
    });
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

  init() {
    return this.loadSession().then(() => {
      return this.getZones();
    });
  }

  async loadSession() {
    await this.platform.ready();

    return this.storage.get("sessionKey_delivery").then(res => {
      this.sessionKey = res;
      // this.sessionInitialized$.next(true);
      console.log("session loaded : ", res);
      return Promise.resolve(res);
    });
  }

  setSession(sessionKey: string) {
    this.sessionKey = sessionKey;
    return this.storage.set("sessionKey_delivery", sessionKey);
  }

  login(email, password) {
    return new Promise((resolve, reject) => {
      this.http
        .post<any>(this.apiUrl + "/employee/login", {
          email: email,
          password: password
        })
        .subscribe(
          res => {
            if (res.result == "success" && res.session_key) {
              this.setSession(res.session_key).then(() => {
                this.init()
                  .then(() => resolve())
                  .catch(err => reject(err));
              });
            } else {
              reject(res.error);
            }
          },
          err => reject(err)
        );
    });
  }

  logOut() {
    console.log("logout");
    this.sessionKey = null;
    return this.storage.set("sessionKey_delivery", null);
  }

  getZones() {
    console.log("getZones");
    return new Promise((resolve, reject) => {
      this.http
        .post<any>(this.apiUrl + "/employee/listzones", {
          session_key: this.sessionKey
        })
        .subscribe(res => {
          console.log(res);
          if (res.error) {
            this.logOut();
            reject(res.error);
          } else {
            this.zones = res;
            resolve();
          }
        });
    });
  }

  processData(data: any): Orders {
    // TODO : store duplibadgeid et rebadgeid from here
    const addresses = data.map(_address => {
      const myBuildings: Array<Building> = [];
      _address.customers.forEach(cust => {
        const index = myBuildings.findIndex(
          _build => _build.id == cust.building.id_building
        );
        const customer = {
          id: cust.id_customer,
          flatNumber: cust.apartment_number,
          floor: cust.floor,
          infos: cust.door_information,
          isNew: cust.is_new,
          name: cust.name,
          notes: "",
          order: {
            state: cust.orders[0].state,
            deliveredTime: null,
            id: cust.orders[0].id,
            totalPrice: null,
            products: cust.orders[0].product_list.map(_product => {
              return {
                name: _product.product_name,
                productId: _product.id_product,
                quantity: _product.quantity,
                price: _product.unit_price
              };
            })
          }
        };
        if (index == -1) {
          myBuildings.push({
            id: cust.building.id_building,
            code: cust.building.code,
            hasBadge: cust.building.badge,
            duplibadgeID: cust.building.duplibadgeid,
            rebadgeID: cust.building.rebadgeid,
            hasElevator: cust.building.elevator,
            hasKey: cust.building.key,
            notes: null,
            comment: cust.building.comment,
            name: cust.building.name,
            customers: [customer],
            valid: false,
            issue: false
          });
        } else {
          myBuildings[index].customers.push(customer);
        }
      });
      return {
        buildings: myBuildings,
        label: `${_address.number} ${_address.street.toLowerCase()}, ${
          _address.city
          } ${_address.postcode}`,
        status: null,
        totalOrders: null
      };
    });

    return {
      addresses: addresses
    };
  }

  getOrders() {
    return new Promise((resolve, reject) => {
      this.http
        .post<any>(this.apiUrl + "/employee/listorders", {
          session_key: this.sessionKey,
          zone: this.zoneId,
          date: format(this.date, "YYYY-MM-DD")
        })
        .pipe(map(this.processData))
        .subscribe(
          res => {
            this.orders = res;
            this.calculateTotal();
            this.counter.total = this.generalInformations.totalCustomer;
            resolve();
          },
          err => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  getOrdersOld() {
    console.log("getOrders...");
    return new Promise((resolve, reject) => {
      this.http.get<Orders>("assets/data/orders.json").subscribe(
        res => {
          this.orders = res;
          this.calculateTotal();
          this.counter.total = this.generalInformations.totalCustomer;
          resolve();
        },
        err => {
          reject(err);
        }
      );
    });
  }

  calculateTotal() {
    let totalCustomer = 0;
    let totalNewCustomers = 0;
    let totalProducts: Array<Product> = [];
    let totalPrice = 0;
    this.orders.addresses.forEach(add => {
      let totalOrders = 0;
      add.buildings.forEach(bld => {
        totalCustomer += bld.customers.length;
        totalOrders += bld.customers.length;
        totalNewCustomers += bld.customers.filter(cust => {
          return cust.isNew == true;
        }).length;
        bld.customers.forEach(cust => {
          let totalOrderPrice = 0;
          cust.order.products.forEach(product => {
            totalOrderPrice += product.price * product.quantity;
            const index = totalProducts.findIndex(_product => {
              return _product.productId == product.productId;
            });
            if (index == -1) {
              totalProducts.push(JSON.parse(JSON.stringify(product)));
            } else {
              totalProducts[index].quantity += product.quantity;
            }
          });
          cust.order.totalPrice = totalOrderPrice;
          totalPrice += totalOrderPrice;
        });
      });
      add.totalOrders = totalOrders;
    });

    this.generalInformations = {
      totalAddresses: this.orders.addresses.length,
      totalCustomer: totalCustomer,
      totalNewCustomers: totalNewCustomers,
      totalProducts: totalProducts,
      totalPrice: totalPrice
    };
  }

  calculateStatus(addresseIndex: number, buildingIndex: number) {
    this.validateBuilding(addresseIndex, buildingIndex);
    this.validateAddress(addresseIndex);
  }

  updateTotalDelivered() {
    let counter = 0;
    this.orders.addresses.forEach(add => {
      add.buildings.forEach(build => {
        build.customers.forEach(cust => {
          if (cust.order.deliveredTime) counter++;
        });
      });
    });
    this.counter.current = counter;
  }

  validateAddress(addresseIndex: number) {
    const addresse = this.orders.addresses[addresseIndex];
    addresse.issue = addresse.buildings.some(
      building =>
        building.issue || (building.notes != null && building.notes.length > 0)
    );
    addresse.valid = addresse.buildings.every(building => building.valid);
  }

  validateBuilding(addresseIndex: number, buildingIndex: number) {
    const building = this.orders.addresses[addresseIndex].buildings[
      buildingIndex
    ];
    building.issue = building.customers.some(cust => cust.notes.length != 0);
    building.valid = building.customers.every(
      cust => cust.order.deliveredTime != null
    );
  }
}

export interface Orders {
  addresses: Array<Address>;
}

export interface Address {
  label: string;
  valid: boolean;
  issue: boolean;
  totalOrders: number;
  buildings: Array<Building>;
}

export interface Building {
  id: string;
  notes: string;
  issue: boolean;
  valid: boolean;
  name: string;
  code: string;
  hasElevator: boolean;
  hasBadge: boolean;
  duplibadgeID: string;
  rebadgeID: string,
  hasKey: boolean;
  customers: Array<Customer>;
  comment: string;
}

export interface Product {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  floor: string;
  flatNumber: string;
  infos: string;
  isNew: boolean;
  notes: string;
  order: {
    id: string;
    deliveredTime: Date;
    products: Array<Product>;
    state: string;
    totalPrice: number;
  };
}
