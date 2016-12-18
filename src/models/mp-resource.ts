import { MpHeaders }              from './mp-headers';
import { MpRequestEventHandler }  from './mp-request-event-handler';
import { MpResponseEventHandler } from './mp-response-event-handler';
import { MpEndPoint }             from './mp-end-point';

export interface MpResource {
  host           : string;
  name           : string;
  headers       ?: MpHeaders;
  beforeRequest ?: MpRequestEventHandler;
  afterResponse ?: MpResponseEventHandler;

  endPoints      : MpEndPoint[];
}
