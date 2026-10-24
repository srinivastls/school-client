import { api } from './client';
export type ImportModule = { key:string; label:string; fields:string[]; requiredOnCreate:string[]; keyField:string };
export type ExportModule = { key:string; label:string; fields:string[] };
export const getBulkMetadata = async () => (await api.get('/bulk-data/metadata')).data;
export const validateBulkImport = async (moduleKey:string, file:{uri:string;name:string;mimeType?:string},fieldMap:Record<string,string>={}) => {
  const form=new FormData(); form.append('file',{uri:file.uri,name:file.name,type:file.mimeType || 'application/octet-stream'} as any);
  form.append('fieldMap',JSON.stringify(fieldMap));
  // Let Axios/React Native set the multipart Content-Type boundary automatically.
  return (await api.post(`/bulk-data/import/${moduleKey}/validate`,form)).data;
};
export const commitBulkImport = async (sessionId:string,mode:'create'|'update'|'both') => (await api.post('/bulk-data/import/commit',{sessionId,mode})).data;
export const downloadBulkExport = async (moduleKey:string,format:'csv'|'xlsx'|'pdf',filters:Record<string,string>={}) =>
  (await api.get(`/bulk-data/export/${moduleKey}`,{params:{...filters,format},responseType:'arraybuffer'})).data;

export const createIndividualStaff = async (input:{name:string;email:string;role:'TEACHER'|'ADMIN';phone?:string;designation?:string;department?:string;employeeId?:string;isActive?:boolean}) => (await api.post('/bulk-data/staff/individual',input)).data;

export const getExportFilterOptions = async (moduleKey:string, filters:Record<string,string>={}) => (await api.get(`/bulk-data/export/${moduleKey}/filter-options`,{params:filters})).data;
