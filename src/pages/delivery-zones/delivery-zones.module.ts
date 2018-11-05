import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeliveryZonesPage } from './delivery-zones';

@NgModule({
  declarations: [
    DeliveryZonesPage,
  ],
  imports: [
    IonicPageModule.forChild(DeliveryZonesPage),
  ],
})
export class DeliveryZonesPageModule {}
