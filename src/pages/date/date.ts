import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { OrderProvider } from "../../providers/order/order";
import { addYears, format } from "date-fns";

@IonicPage()
@Component({
  selector: "page-date",
  templateUrl: "date.html"
})
export class DatePage {
  public minDate = new Date().toISOString();
  public maxDate = addYears(new Date(), 1).toISOString();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public os: OrderProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad DatePage");
  }

  next() {
    this.navCtrl.setRoot("AddressesListPage", null, {
      animate: true,
      animation: "push",
      direction: "forward"
    });
  }
}
