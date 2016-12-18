import { MpRequestEventHandler }  from './mp-request-event-handler';
import { MpResponseEventHandler } from './mp-response-event-handler';
import { MpHeaders }              from './mp-headers';
import { MpResource }             from './mp-resource';

export interface MpConfig {
  host           : string;
  headers       ?: MpHeaders,
  beforeRequest ?: MpRequestEventHandler
  afterResponse ?: MpResponseEventHandler

  resources      : MpResource[];
}
