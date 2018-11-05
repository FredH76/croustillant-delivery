import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";

@IonicPage()
@Component({
  selector: "page-notes",
  templateUrl: "notes.html"
})
export class NotesPage {
  notes: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.notes = this.navParams.get("notes");
  }

  add() {
    this.close({ notes: this.notes });
  }

  close(data) {
    this.viewCtrl.dismiss(data);
  }
}
