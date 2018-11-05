import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppartementsListPage } from './appartements-list';

@NgModule({
  declarations: [
    AppartementsListPage,
  ],
  imports: [
    IonicPageModule.forChild(AppartementsListPage),
  ],
})
export class AppartementsListPageModule {}
