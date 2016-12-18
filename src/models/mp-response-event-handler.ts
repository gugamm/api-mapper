import { MpRequest } from './mp-request';
import { MpResponse } from './mp-response';

export interface MpResponseEventHandler {
  (request : MpRequest, response : MpResponse) : any | Promise<any>;
}