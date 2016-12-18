import { MpRequest } from './mp-request';

export interface MpRequestEventHandler {
  (request : MpRequest) : boolean | Promise<boolean>
}
