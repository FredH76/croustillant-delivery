import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderProvider, Order, Product, Address, Customer } from '../order/order';

@Injectable()
export class MapotempoProvider {

  mapotempoApiUrl: string;
  mapotempoPlanExportApiUrl: string;
  plannings: any;
  destinations: any;
  lastExport: any;

  constructor(public http: HttpClient, private os: OrderProvider) {
    this.mapotempoApiUrl = 'https://app.mapotempo.com/api/0.1';
    this.mapotempoPlanExportApiUrl = 'https://croustillant-delivery.herokuapp.com';
  }

  init() {
    return this.getDestinations();
  }

  getDestinations() {
    return new Promise((resolve, reject) => {
      if (!this.os.loggedInfo || !this.os.loggedInfo.mapotempoApiKey) {
        return reject('No Mapotempo api key provided.');
      }
      this.http
        .get<any>(this.mapotempoApiUrl + '/destinations?api_key=' + this.os.loggedInfo.mapotempoApiKey)
        .subscribe(res => {
          if (res.error) {
            reject(res.error);
          } else {
            this.destinations = res;
            resolve();
          }
        });
    });
  }

  getPlannings() {
    return new Promise((resolve, reject) => {
      if (!this.os.loggedInfo || !this.os.loggedInfo.mapotempoApiKey) {
        return reject('No Mapotempo api key provided.');
      }
      this.http
        .get<any>(this.mapotempoApiUrl + '/plannings', {
          params: {
            api_key: this.os.loggedInfo.mapotempoApiKey,
            active: 'true'
          }
        })
        .subscribe(res => {
          if (res.error) {
            reject(res.error);
          } else {
            this.plannings = res;
            resolve(res);
          }
        });
    });
  }

  exportPlanningsToMapotempo() {
    return new Promise((resolve, reject) => {
      if (!this.os.loggedInfo || !this.os.loggedInfo.mapotempoApiKey) {
        return reject('No Mapotempo api key provided.');
      }
      this.http
        .post<any>(this.mapotempoPlanExportApiUrl + '/plannings', {
          sessionKey: this.os.sessionKey
        })
        .subscribe(
        res => {
          if (res.success === true) {
            resolve();
          } else {
            reject({
              message: res.message,
              error: res.error
            });
          }
        },
        err => reject(err)
        );
    });
  }

  getLastExport() {
    return new Promise((resolve, reject) => {
      this.http
        .get<any>(this.mapotempoPlanExportApiUrl + '/plannings/status')
        .subscribe(res => {
          if (res.error) {
            reject(res.error);
          } else {
            this.lastExport = res.lastExport;
            resolve(this.lastExport);
          }
        }, err => {
          reject(err);
        });
    });
  }

  async getRoutes(planningId: string) {
    if (!this.os.orders) {
      await this.os.getOrders();
    }
    if (!this.destinations) {
      await this.getDestinations();
    }
    return new Promise((resolve, reject) => {
      if (!this.os.loggedInfo || !this.os.loggedInfo.mapotempoApiKey) {
        return reject('No Mapotempo api key provided.');
      }
      this.http
        .get<Array<MapotempoRoute>>(this.mapotempoApiUrl + `/plannings/${planningId}/routes`, {
          params: {
            api_key: this.os.loggedInfo.mapotempoApiKey
          }
        })
        .subscribe(res => {
          if ((res as any).error) {
            reject((res as any).error);
          } else {
            if (res) {
              res = res.filter(r => r.distance > 0);
              res.forEach(route => {
                route.stops.forEach(stop => {
                  const order = this.getOrder(stop.visit_ref);
                  if (order) {
                    stop.order = order;
                    stop.foundOrder = true;
                  } else {
                    stop.foundOrder = false;
                  }
                  stop.destination = this.destinations.find(d => d.id === stop.destination_id);
                });
                route.total = this.getTotal(route);
              });
            }
            resolve(res);
          }
        });
    });
  }

  private getTotal(route: MapotempoRoute) {
    const addresses = new Array<Address>();
    const customers = new Array<Customer>();
    const products = new Array<Product>();
    let customersCount = 0;
    let totalAmount = 0;
    route.stops.forEach(stop => {
      if (stop.order) {
        if (stop.order.address) {
          const address = stop.order.address;
          const foundIndex = addresses.findIndex(a => a.label === address.label);
          if (foundIndex < 0) {
            addresses.push(address);
          }
        }
        if (stop.order.customer) {
          const customer = stop.order.customer;
          if (!customers[customer.id]) {
            customersCount = customersCount + 1;
            customers[customer.id] = customer;
          }
        }
        if (stop.order.products) {
          stop.order.products.forEach(product => {
            totalAmount += product.price * product.quantity;
            const foundIndex = products.findIndex(sp => sp.productId === product.productId);
            if (foundIndex < 0) {
              products.push({
                name: product.name,
                price: product.price,
                productId: product.productId,
                quantity: product.quantity
              });
            } else {
              products[foundIndex].quantity += product.quantity;
            }
          });
        }
      }
    });
    const newCustomers = customers.filter(c => c.isNew === true).length;

    return {
      addresses: addresses.length ,
      customers: customersCount,
      newCustomers,
      amount: Math.round(totalAmount * 100) / 100,
      products
    };
  }

  private countDistinct(array: Array<any>) {
    const counts = Object.create(null);
    array.forEach(val => {
      counts[val] = counts[val] ? counts[val] + 1 : 1;
    });
    return counts;
  }

  private getOrder(visitId: string) {
    if (!this.os.orders) {
      return;
    }
    return this.os.orders.find(o => o.id.toString() === visitId);
  }

  getGeocodedAddress(id: number) {
    return this.destinations.find(d => d.ref === id.toString());
  }

}

export interface GeocodedAddress {
  id: number;
  ref: string;
  lat: number;
  lng: number;
  geocoding_accuracy: number;
  geocoding_level: string;
}

export interface MapotempoRoute {
  id: number;
  ref: string;
  distance: number;
  emission: string;
  vehicle_usage_id: number;
  start: string;
  end: string;
  hidden: boolean;
  locked: boolean;
  out_of_date: boolean;
  outdated: boolean;
  departure_status: string;
  departure_eta: string;
  arrival_status: string;
  arrival_eta: string;
  stop_out_of_drive_time: boolean;
  stop_out_of_work_time: boolean;
  stop_out_of_max_distance: boolean;
  stop_distance: number;
  stop_drive_time: number;
  color: string;
  updated_at: string;
  last_sent_to: string;
  last_sent_at: string;
  optimized_at: string;
  quantities: [
    {
      deliverable_unit_id: number;
      quantity: number;
      operation: any
    }
  ];
  geojson: any;
  stops: Array<MapotempoStop>;
  total: {
    addresses: number,
    customers: number,
    newCustomers: number,
    amount: number,
    products: Array<Product>
  };
}

export interface MapotempoStop {
  id: number;
  visit_ref: string;
  destination_ref: string;
  index: number;
  active: true;
  distance: number;
  drive_time: number;
  visit_id: number;
  destination_id: number;
  wait_time: number;
  time: string;
  out_of_window: boolean;
  out_of_capacity: boolean;
  out_of_drive_time: boolean;
  out_of_work_time: boolean;
  out_of_max_distance: boolean;
  status: string;
  eta: string;
  order: Order;
  foundOrder: boolean;
  destination: GeocodedAddress;
}
