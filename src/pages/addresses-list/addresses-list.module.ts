import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { AddressesListPage } from "./addresses-list";

@NgModule({
  declarations: [AddressesListPage],
  imports: [IonicPageModule.forChild(AddressesListPage)]
})
export class AddressesListPageModule {}
