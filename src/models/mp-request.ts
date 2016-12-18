import { MpEndPoint } from './mp-end-point';
import { MpHeaders } from './mp-headers';
import { MpRequestParams } from './mp-request-params';

export interface MpRequest {
  fullPath  : string;
  endPoint  : MpEndPoint;
  headers   : MpHeaders;
  body     ?: any;
  params   ?: MpRequestParams;
}

export function buildMpRequest(fullPath : string, endPoint : MpEndPoint, headers : MpHeaders, body ?: any, params ?: MpRequestParams) : MpRequest {
  return {
    fullPath : fullPath,
    endPoint : endPoint,
    headers  : headers,
    body     : body,
    params   : params
  };
}