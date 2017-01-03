import { MpHeaders, MpRequestEventHandler, MpResponseEventHandler, MpHttpLayer,
  MpConfig, MpResource, MpEndPoint, MpRequestParams, MpRequest, buildMpRequest, MpResponse, MpHttpRequestMethod } from './models/index';

export class MpResourceMap {
  public name           : string;
  public host           : string;
  public endPoints      : {[endPointName : string] : MpEndPoint};
  public headers       ?: MpHeaders;
  public beforeRequest ?: MpRequestEventHandler;
  public afterResponse ?: MpResponseEventHandler;

  private apiMap        : MpApiMap;

  constructor(apiMap : MpApiMap, resource : MpResource) {
    this.apiMap        = apiMap;
    this.name          = resource.name;
    this.host          = resource.host;
    this.headers       = resource.headers;
    this.beforeRequest = resource.beforeRequest;
    this.afterResponse = resource.afterResponse;
    this.endPoints     = {};

    this.addEndPointsMethods(resource.endPoints);
  }

  private addEndPointsMethods(endPoints : MpEndPoint[]) : void {
    endPoints.forEach(
      (endPoint : MpEndPoint) => {
        this.endPoints[endPoint.name] = endPoint;
      }
    );
    endPoints.forEach((endPoint : MpEndPoint) => this.addEndPointMethod(endPoint));
  }

  private addEndPointMethod(endPoint : MpEndPoint) : void {
    this[endPoint.name] = (params ?: MpRequestParams, body ?: any, headers ?: MpHeaders, options ?: any) => {
      return new Promise((resolve, reject) => {
        const aHeaders : MpHeaders = Object.assign({}, this.apiMap.headers, this.headers, this.endPoints[endPoint.name].headers, headers);
        let request : MpRequest = buildMpRequest(this.buildFullPath(this.endPoints[endPoint.name], params), this.endPoints[endPoint.name], aHeaders, body, params);

        this.solveBeforeRequest(request).then(
          () => {
            this.doRequest(request, options).then(
              (response : MpResponse) => {
                this.solveAfterResponse(request,response).then(
                  () => resolve(response)
                ).catch(
                  (err : any) => reject(err)
                );
              }
            ).catch(
              (response : MpResponse) => {
                this.solveAfterResponse(request,response).then(
                  () => reject(response)
                ).catch(
                  (err : any) => reject(err)
                );
              }
            )
          }
        ).catch(
          (err : any) => reject(err)
        )
      });
    }
  }

  private buildFullPath(endPoint : MpEndPoint, params ?: MpRequestParams) : string {
    let fullPath : string = `${this.apiMap.host}${this.host}${endPoint.path}`;
    if (params) {
      let aParams = Object.assign({}, params);
      for (let param in aParams) {
        const reg = new RegExp(`{${param}}`);
        if (fullPath.search(reg) >= 0) {
          fullPath = fullPath.replace(reg, `${aParams[param]}`);
          delete aParams[param];
        }
      }

      let hasQuestionMark = false;

      for (let param in aParams) {
        if (!hasQuestionMark) {
          let encodeParam = `${aParams[param]}`;
          encodeParam = encodeURIComponent(encodeParam);
          fullPath += `?${param}=${encodeParam}`;
          hasQuestionMark = true;
        } else {
          let encodeParam = `${aParams[param]}`;
          encodeParam = encodeURIComponent(encodeParam);
          fullPath += `&${param}=${encodeParam}`;
        }
      }
    }
    return fullPath;
  }

  private solveBeforeRequest(request : MpRequest) : Promise<any> {
    return new Promise((resolve, reject) => {
      function solveFunc(beforeRequest : MpRequestEventHandler, request : MpRequest) : Promise<any> {
        return new Promise(function (resolve, reject) {
          if (!beforeRequest)
            resolve();
          let result = beforeRequest(request);
          if (result instanceof Promise) {
            result.then(
              (r : boolean) => {
                if (r)
                  resolve();
                else
                  reject();
              },
              () => reject()
            );
          } else {
            if (result)
              resolve();
            else
              reject();
          }
        });
      }

      solveFunc(this.apiMap.beforeRequest, request).then(
        () => {
          solveFunc(this.beforeRequest, request).then(
            () => solveFunc(request.endPoint.beforeRequest, request).then(
              () => resolve(),
              () => reject()
            ),
            () => reject()
          )
        },
        () => reject()
      );
    });
  }

  private buildEventPromise(result : any) : Promise<boolean> {
    if (result instanceof Promise)
      return result;
    return new Promise((resolve, reject) => {
      resolve(result);
    });
  }

  private doRequest(request : MpRequest, options ?: any) : Promise<MpResponse> {
    switch (request.endPoint.method) {
      case MpHttpRequestMethod.GET    : return this.apiMap.httpLayer.get(request, options);
      case MpHttpRequestMethod.PUT    : return this.apiMap.httpLayer.put(request, options);
      case MpHttpRequestMethod.POST   : return this.apiMap.httpLayer.post(request, options);
      case MpHttpRequestMethod.HEAD   : return this.apiMap.httpLayer.head(request, options);
      case MpHttpRequestMethod.DELETE : return this.apiMap.httpLayer.delete(request, options);
      case MpHttpRequestMethod.PATCH  : return this.apiMap.httpLayer.patch(request, options);
      default                         : return this.apiMap.httpLayer.get(request, options);
    }
  }

  private solveAfterResponse(request : MpRequest, response : MpResponse) : Promise<any> {
    return new Promise((resolve, reject) => {
      function solveFunc(afterResponse : MpResponseEventHandler, request : MpRequest, response : MpResponse) : Promise<any> {
        return new Promise(function (resolve, reject) {
          if (!afterResponse)
            resolve();
          let result = afterResponse(request, response);
          if (result instanceof Promise) {
            result.then(
              () => {
                resolve()
              },
              () => resolve()
            );
          } else {
            resolve()
          }
        });
      }

      solveFunc(this.apiMap.afterResponse, request, response).then(
        () => {
          solveFunc(this.afterResponse, request, response).then(
            () => solveFunc(request.endPoint.afterResponse, request, response).then(
              () => resolve(),
              () => reject()
            ),
            () => reject()
          )
        },
        () => reject()
      );
    });
  }
}

export class MpApiMap {
  public host      : string;
  public headers   : MpHeaders;
  public httpLayer : MpHttpLayer;

  public beforeRequest : MpRequestEventHandler;
  public afterResponse : MpResponseEventHandler;

  constructor(mapperConfig : MpConfig, httpLayer : MpHttpLayer) {
    this.host          = mapperConfig.host;
    this.headers       = mapperConfig.headers;
    this.httpLayer     = httpLayer;
    this.beforeRequest = mapperConfig.beforeRequest;
    this.afterResponse = mapperConfig.afterResponse;
    this.addResourceMaps(this.buildResourceMaps(mapperConfig.resources));
  }

  public buildResourceMap(resource : MpResource) : MpResourceMap {
    return new MpResourceMap(this, resource);
  }

  public buildResourceMaps(resources : MpResource[]) : MpResourceMap[] {
    return resources.map((resource : MpResource) => this.buildResourceMap(resource));
  }

  public addResourceMap(resourceMap : MpResourceMap) : void {
    let anyThis : any = this;
    anyThis[resourceMap.name] = resourceMap;
  }

  public addResourceMaps(resourceMaps : MpResourceMap[]) : void {
    resourceMaps.forEach(
      (resourceMap : MpResourceMap) => this.addResourceMap(resourceMap)
    );
  }

  public removeResourceMap(resourceMap : MpResourceMap) : void {
    let anyThis : any = this;
    delete anyThis[resourceMap.name];
  }

  public removeResourceMaps(resourceMaps : MpResourceMap[]) : void {
    resourceMaps.forEach(
      (resourceMap : MpResourceMap) => this.removeResourceMap(resourceMap)
    );
  }
}

export * from './models/index';
export * from './http-layers/browser-layer';