import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Loading, ToastController, LoadingController } from 'ionic-angular';

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
  public loading: Loading;

  constructor(
    public http: HttpClient,
  ) {
    this.api_token = "4be9211ecd6286e1078c3ce7424ee0d71095944b";
    this.rebadge_url = "https://api.rebadge.services"; //"https://45.55.67.168";    //TODO: replace when valid 
    this.duplibadge_url = "https://api.rebadge.services"; // "https://45.55.67.168"; //TODO: replace when valid 
  }

  /**
   * return the Uint8Array corresponding to the slug
   * 
   * @param slug : badge or rebadge ID
   * @param type : REBADGE or DUPLIBADGE type
   */
  downloadBadge(slug, badgeType) {

    return new Promise((resolve, reject) => {
      let url: string;

      // select the proper url according to badge type
      switch (badgeType) {
        case "REBADGE":
          url = this.rebadge_url;
          break;
        case "DUPLIBADGE":
          url = this.duplibadge_url;
          break;
        default:
          reject("unknown badge type (expected REBADGE or DUPLIBADGE");
      }

      // prepare to pass parameter to GET request
      let params = new HttpParams()
        .set("api_token", this.api_token)
        .set("slug", slug);
      //.set("output", outputType); // other possible format: 'json' or

      // Send http request to download dump as a file (blob)
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
          err => {
            // handle error status here:
            switch (err.status) {
              case 404:
                err.msg = "aucun badge ne correspond aux données envoyées";
                break;
              default:
                err.msg = "erreur de communication avec le serveur de badge";
            }
            reject(err);
          }
        );
    });
  }


}
