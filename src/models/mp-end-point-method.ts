import { MpRequestParams } from './mp-request-params';
import { MpHeaders }       from './mp-headers';
import { MpResponse }      from './mp-response';

export interface MpEndPointMethod {
  (params ?: MpRequestParams, body ?: any, headers ?: MpHeaders, options ?: any) : Promise<MpResponse>
}