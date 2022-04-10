import { paths } from './api.auto';

export type ParseReq = paths['/parse']['post']['requestBody']['content']['application/json'];
export type ValidateReq = paths['/validate']['post']['requestBody']['content']['text/plain'];
