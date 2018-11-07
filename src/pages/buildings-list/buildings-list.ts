import { Component, Pipe, PipeTransform } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { OrderProvider, Building, Customer } from "../../providers/order/order";
import { ParklinkProvider } from "../../providers/parklink/parklink";

@IonicPage()
@Component({
  selector: "page-buildings-list",
  templateUrl: "buildings-list.html"
})
export class BuildingsListPage {
  public mode = "1";
  public customers: Array<Customer> = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider,
    public pk: ParklinkProvider
  ) {
    this.os.orders.addresses[this.addresseIndex].buildings.forEach(build => {
      build.customers.forEach(cust => {
        this.customers.push(cust);
        cust.order.deliveredTime;
        cust.notes;
      });
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
   * download badge from parklink
   */
  downloadBadge(building) {
    this.pk.downloadBadge("92687E00846E", "DUPLIBADGE");
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
