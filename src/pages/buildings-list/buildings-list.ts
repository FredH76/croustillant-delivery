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
  public hasBadge: boolean = false;
  public badgeID: string = "";
  public badgeTYPE: string = "";
  badge: Uint8Array;

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

      // Merge information about building badge (since this nformations is duplicated for each buildings)
      // and store badge type
      if (build.hasBadge) {
        this.hasBadge = true;

        if (build.rebadgeID) {
          this.badgeID = build.rebadgeID
          this.badgeTYPE = "REBADGE";
        }

        if (build.duplibadgeID) {
          this.badgeID = build.duplibadgeID
          this.badgeTYPE = "DUPLIBADGE";
        }

        // TEMPORARY DATA for DEBUG 
        this.badgeID = "9268-7E00-846E";
        this.badgeTYPE = "REBADGE"
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
   * download badge from parklink
   */
  downloadBadge() {
    this.pk.downloadBadge(this.badgeID, this.badgeTYPE).then(
      (badge: Uint8Array) => this.badge = badge,
      err => console.log(err)
    );
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
