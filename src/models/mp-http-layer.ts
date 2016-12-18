import { MpRequest } from './mp-request';
import { MpResponse } from './mp-response';

export interface MpHttpLayer {
  get    ?: (request : MpRequest, options ?: any) => Promise<MpResponse>;
  put    ?: (request : MpRequest, options ?: any) => Promise<MpResponse>;
  post   ?: (request : MpRequest, options ?: any) => Promise<MpResponse>;
  head   ?: (request : MpRequest, options ?: any) => Promise<MpResponse>;
  delete ?: (request : MpRequest, options ?: any) => Promise<MpResponse>;
}
