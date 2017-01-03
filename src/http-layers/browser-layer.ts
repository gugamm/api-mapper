import { MpHttpLayer, MpRequest, MpResponse } from '../models/index';

export class MpBrowserHttpLayer implements MpHttpLayer {
  private buildXhr() : any {
    if (XMLHttpRequest)
      return new XMLHttpRequest();
    else
      return new ActiveXObject('Microsoft.XMLHTTP');
  }
  private doRequest(method : string, request : MpRequest) : Promise<MpResponse> {
    return new Promise(function (resolve, reject) {
      let xhr = this.buildXhr();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          const response : MpResponse = {
            ok : xhr.status >= 200 && xhr.status <= 299,
            data : xhr.responseText,
            extras : xhr
          };
          resolve(response);
        }
      };
      xhr.open(method, request.fullPath, true);
      for (let hKey in request.headers)
        xhr.setRequestHeader(hKey,request.headers[hKey]);
      xhr.send(request.body);
    });
  }

  public get(request : MpRequest)    : Promise<MpResponse> {
    return this.doRequest('GET', request);
  }
  public put(request : MpRequest)    : Promise<MpResponse> {
    return this.doRequest('PUT', request);
  }
  public post(request : MpRequest)   : Promise<MpResponse> {
    return this.doRequest('POST', request);
  }
  public head(request : MpRequest)   : Promise<MpResponse> {
    return this.doRequest('HEAD', request);
  }
  public delete(request : MpRequest) : Promise<MpResponse> {
    return this.doRequest('DELETE', request);
  }
  public patch(request : MpRequest)  : Promise<MpResponse> {
    return this.doRequest('PATCH', request);
  }
}
