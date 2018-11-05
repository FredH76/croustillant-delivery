import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { BuildingsListPage, FormatBooleanPipe } from "./buildings-list";

@NgModule({
  declarations: [BuildingsListPage, FormatBooleanPipe],
  imports: [IonicPageModule.forChild(BuildingsListPage)]
})
export class BuildingsListPageModule {}
