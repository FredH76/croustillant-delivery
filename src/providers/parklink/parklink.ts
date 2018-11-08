import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

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
  public badgeBuffer: any;
  badgeFile: any;

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

      // prepare to pass parameter to GET request
      let params = new HttpParams().set("api_token", this.api_token).set("slug", slug); //Create new HttpParams
      //let headers = new HttpHeaders().set('Content-Type', 'application/octet-stream');

      // Send http request to download dump
      this.http
        .get(url + "/public/fetch_dump.json", {
          responseType: 'blob',
          params: params
        })
        .subscribe(
          blob => {

            // read blob
            var myReader = new FileReader();
            myReader.readAsArrayBuffer(blob)

            // store result
            myReader.addEventListener("loadend", function (event) {
              var buffer = myReader.result; //arraybuffer object
              var badgeBuffer = new Uint8Array(buffer);
              resolve(badgeBuffer);
            });
          },
          err => reject(err)
        );
    });
  }


}
