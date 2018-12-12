import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
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
  mapotempoApiUrl: string;
  zones: any;
  zoneId: any;
  date = new Date().toISOString();
  sessionKey: any;
  loggedInfo: LoggedInfo;
  public orders: Array<Order>;
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
    this.orders.forEach(o => {
      if (o.customer.notes)
        report += "Commande " + o.id + " / Client " + o.customer.id + " / Building " + o.address.buildingId + "\n" + o.customer.notes + "\n\n";

      if (o.valid) {
        orders.push({
          id: o.id,
          date: o.deliveredTime
        });
      }
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
      this.storage.get("loggedInfo").then((loggedInfo: LoggedInfo) => {
        this.loggedInfo = loggedInfo;
      });
      // this.sessionInitialized$.next(true);
      console.log("session loaded : ", res);
      return Promise.resolve(res);
    });
  }

  setSession(sessionKey: string, loggedInfo: LoggedInfo) {
    this.sessionKey = sessionKey;
    this.loggedInfo = loggedInfo;
    return this.storage.set("sessionKey_delivery", sessionKey).then(() => {
      return this.storage.set("loggedInfo", loggedInfo);
    });
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
            this.setSession(res.session_key, {
              email: res.email,
              mapboxApiKey: res.mapbox_api_key,
              mapotempoApiKey: res.mapotempo_api_key
            }).then(() => {
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

  processData(data: Array<ApiOrder>): Array<Order> {

    const returningOrders = new Array<Order>();
    data.forEach(a => {
      a.customers.forEach(c => {
        const addressToUse: Address = {
          label: `${a.number} ${a.street.toLowerCase()}, ${
            a.city
            } ${a.postcode}`,
          city: a.city,
          number: a.number,
          postcode: a.postcode,
          street: a.street,
          buildingId: c.building.id_building,
          issue: false,
          comment: c.building.comment,
          name: c.building.name,
          code: c.building.code,
          hasElevator: c.building.elevator,
          hasBadge: c.building.badge,
          duplibadgeID: c.building.duplibadgeid,
          rebadgeID: c.building.rebadgeid,
          hasKey: c.building.key
        };
        const customerToUse: Customer = {
          doorInformation: c.door_information,
          flatNumber: c.apartment_number,
          floor: c.floor,
          id: c.id_customer,
          isNew: c.is_new,
          name: c.name,
          notes: ""
        };
        c.orders.forEach(o => {
          const productList = new Array<Product>();
          o.product_list.forEach(p => {
            productList.push({
              productId: p.id_product.toString(),
              name: p.product_name,
              price: parseFloat(p.unit_price),
              quantity: p.quantity
            })
          });
          returningOrders.push({
            id: o.id,
            created: o.created,
            deliveredTime: o.delivered,
            products: productList,
            reference: o.reference,
            state: o.state,
            address: addressToUse,
            customer: customerToUse,
            valid: false
          });
        });
      });
    });
    return returningOrders;

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

  /* getOrdersOld() {
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
  } */

  calculateTotal() {
    let totalCustomer = 0;
    let totalNewCustomers = 0;
    let totalProducts: Array<Product> = [];
    let totalPrice = 0;

    totalNewCustomers = this.orders.filter(o => o.customer.isNew).length;

    this.orders.forEach(o => {
      o.products.forEach(p => {
        totalPrice += p.price * p.quantity;
        const index = totalProducts.findIndex(_product => {
          return _product.productId == p.productId;
        });
        if (index == -1) {
          totalProducts.push(JSON.parse(JSON.stringify(p)));
        } else {
          totalProducts[index].quantity += p.quantity;
        }
      });
    });

    const totalAddresses = this.orders.filter((item, index, inputArray) => {
      return inputArray.indexOf(item) == index;
    }).length;

    this.generalInformations = {
      totalAddresses: totalAddresses,
      totalCustomer: this.orders.length,
      totalNewCustomers: totalNewCustomers,
      totalProducts: totalProducts,
      totalPrice: Math.round(totalPrice * 100) / 100
    };
  }

  calculateStatus(order: Order) {
    this.validateOrder(order);
  }

  updateTotalDelivered() {
    this.counter.current = this.orders.filter(o => o.valid).length;
  }

  validateOrder(order: Order) {
    order.address.issue = order.customer.notes != null && order.customer.notes !== "";
    order.valid = order.deliveredTime != null && order.deliveredTime.length > 0 && order.deliveredTime != "0000-00-00 00:00:00";

  }
}

export interface Order {
  id: number;
  created: string;
  products: Array<Product>;
  reference: string;
  state: string;
  address: Address;
  customer: Customer;
  deliveredTime: string;
  valid: boolean;
}

export interface Address {
  label: string;
  city: string;
  number: string;
  postcode: string;
  street: string;
  buildingId: string;
  issue: boolean;
  name: string;
  code: string;
  hasElevator: boolean;
  hasBadge: boolean;
  duplibadgeID: string;
  rebadgeID: string,
  hasKey: boolean;
  comment: string;
}

export interface LoggedInfo {
  email: string;
  mapboxApiKey: string;
  mapotempoApiKey: string;
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
  doorInformation: string;
  isNew: boolean;
  notes: string;
}

export interface ApiOrder {
  street: string;
  number: string;
  postcode: string;
  city: string;
  customers: [
    {
      id_customer: string;
      id_address: string;
      name: string;
      floor: string;
      door_information: string;
      building: {
        id_building: string;
        name: string;
        badge: boolean;
        code: string;
        key: boolean;
        elevator: boolean;
        duplibadgeid: string;
        rebadgeid: string;
        comment: string
      };
      apartment_number: string;
      comment: string;
      is_new: boolean;
      orders: [
        {
          id: number;
          reference: string;
          state: string;
          created: string;
          delivered: string;
          product_list: [
            {
              id_product: number;
              product_name: string;
              unit_price: string;
              quantity: number;
              total_price: string
            }
          ]
        }
      ]
    }
  ]
}
