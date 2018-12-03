import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlanningsPage } from './plannings';

@NgModule({
  declarations: [
    PlanningsPage,
  ],
  imports: [
    IonicPageModule.forChild(PlanningsPage),
  ],
})
export class PlanningsPageModule {}
