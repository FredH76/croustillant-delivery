import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Loading,
  LoadingController
} from "ionic-angular";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { OrderProvider } from "../../providers/order/order";

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  public form: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    public os: OrderProvider
  ) {
    this.form = this.formBuilder.group({
      email: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });
  }

  get email() {
    return this.form.get("email");
  }

  get password() {
    return this.form.get("password");
  }

  login() {
    if (!this.form.valid) {
      this.email.markAsTouched();
      this.password.markAsTouched();
      return;
    }

    this.os.startLoading();
    this.os
      .login(this.email.value, this.password.value)
      .then(() => {
        this.navCtrl.setRoot("PlanningsPage", null, {
          animate: true,
          animation: "push",
          direction: "forward"
        });
      })
      .catch(err => {
        this.os.stopLoading();
        this.os.presentToastError(err);
      });
  }
}
