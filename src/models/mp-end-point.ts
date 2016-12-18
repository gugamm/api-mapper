import { MpHeaders } from './mp-headers';
import { MpRequestEventHandler } from './mp-request-event-handler';
import { MpResponseEventHandler } from './mp-response-event-handler';
import { MpHttpRequestMethod } from './mp-http-request-method';

export interface MpEndPoint {
  path           : string;
  name           : string;
  method        ?: MpHttpRequestMethod;
  headers       ?: MpHeaders;
  beforeRequest ?: MpRequestEventHandler;
  afterResponse ?: MpResponseEventHandler;
}