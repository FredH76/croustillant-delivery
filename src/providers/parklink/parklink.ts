import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ParklinkProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ParklinkProvider {
  api_token: string;
  slug: string;
  rebadge_url: string;
  duplibadge_url: string;

  constructor(public http: HttpClient) {
    this.api_token = "4be9211ecd6286e1078c3ce7424ee0d71095944b";
    this.rebadge_url = "https://45.55.67.168"; //"https://api.rebadge.services";
    this.duplibadge_url = "https://45.55.67.168"; //"https://api.rebadge.services";
  }

  /**
   * return the byte array corresponding to the slug
   * 
   * @param slug : badge or rebadge ID
   * @param type : REBADGE or DUPLIBADGE type
   */
  downloadBadge(slug, type) {
    return new Promise((resolve, reject) => {
      let url: string;

      // select the proper url according to badge type
      switch (type) {
        case "REBADGE":
          url = this.rebadge_url;
          break;
        case "DUPLIBADGE":
          url = this.duplibadge_url;
          break;
        default:
          reject("unknown badge type (expected REBADGE or DUPLIBADGE");
      }

      //TODO: add a spinner during download

      // prepare to pass parameter to GET
      let params = new HttpParams().set("api_token", this.api_token).set("slug", slug); //Create new HttpParams

      // Send http request to download dump
      this.http
        .get<any>(url + "/public/fetch_dump.json", {
          //responsetype : ResponseContentType.blo
          params: params
        })
        .subscribe(
          res => {
            if (res.result == "success" && res.session_key) {
              console.log("success" + res);
              resolve("success");
            } else {
              console.log("error" + res);
              reject("error");
            }
          },
          //err => reject(err)
        );
    });
  }


}
