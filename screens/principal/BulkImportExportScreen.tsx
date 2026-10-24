import React,{useEffect,useState} from 'react';
import {ActivityIndicator,Alert,Modal,Platform,ScrollView,Text,TextInput,TouchableOpacity,View} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {encode} from 'base64-arraybuffer';
import {commitBulkImport,createIndividualStaff,downloadBulkExport,getBulkMetadata,getExportFilterOptions,validateBulkImport} from '../../services/bulkImportExportServices';

type Props={academicYearId?:string};
const formats=['csv','xlsx','pdf'] as const;
export default function BulkImportExportScreen({academicYearId}:Props){
 const [modules,setModules]=useState<any>({importModules:[],exportModules:[]}); const [moduleKey,setModuleKey]=useState('students'); const [filterOptions,setFilterOptions]=useState<any>({});
 const [dropdown,setDropdown]=useState<any>(null);
 const [dropdownSearch,setDropdownSearch]=useState('');
 const openDropdown=(title:string,value:any,options:any[],onSelect:(value:any)=>void)=>{setDropdownSearch('');setDropdown({title,value,options,onSelect});};
 const renderDropdown=(title:string,value:any,options:any[],onSelect:(value:any)=>void)=>{
   const selectedOption=options.find((option:any)=>String(option.value)===String(value));
   return <TouchableOpacity onPress={()=>openDropdown(title,value,options,onSelect)} style={{borderWidth:1,borderColor:'#d0d5dd',borderRadius:8,padding:12,marginTop:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:46}}>
    <Text style={{color:'#344054',flex:1}}>{selectedOption?.label||title}</Text><Text style={{color:'#667085',marginLeft:12}}>▼</Text>
   </TouchableOpacity>;
 };
 const [staff,setStaff]=useState<any>({name:'',email:'',role:'TEACHER',phone:'',designation:'',department:'',employeeId:''});
 const [file,setFile]=useState<any>(null); const [validation,setValidation]=useState<any>(null); const [fieldMap,setFieldMap]=useState<Record<string,string>>({}); const [mode,setMode]=useState<'create'|'update'|'both'>('both'); const [busy,setBusy]=useState(false); const [exportFilters,setExportFilters]=useState<any>({dateFrom:'',dateTo:'',month:'',classId:'',sectionId:'',paymentMode:'',role:'',isActive:'',status:'',gender:'',category:'',search:'',studentId:'',examId:'',subjectId:'',isAbsent:'',isFinalized:'',academicYearId:'',type:'',isCompleted:'',department:'',receiptNumber:'',classNumber:''});
 useEffect(()=>{getBulkMetadata().then(setModules).catch(e=>Alert.alert('Unable to load modules',e?.message||'Please try again'));},[]);
 useEffect(()=>{let active=true;getExportFilterOptions(moduleKey,{academicYearId:exportFilters.academicYearId||academicYearId||'',classId:exportFilters.classId||'',sectionId:exportFilters.sectionId||''}).then((v:any)=>{if(active)setFilterOptions(v||{});}).catch((e:any)=>{if(active)setFilterOptions({});});return()=>{active=false;};},[moduleKey,exportFilters.academicYearId,exportFilters.classId,exportFilters.sectionId,academicYearId]);
 const chooseFile=async()=>{const result=await DocumentPicker.getDocumentAsync({type:['text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'],copyToCacheDirectory:true});if(!result.canceled){setFile(result.assets[0]);setValidation(null);setFieldMap({});}};
 const validate=async()=>{if(!file){Alert.alert('Choose a file','Select a CSV or XLSX file first.');return;}setBusy(true);try{const r=await validateBulkImport(moduleKey,{
       uri:file.uri,name:file.name,mimeType:file.mimeType,
       ...(Platform.OS==='web' && file.file ? {file:file.file} : {})
      },fieldMap);setValidation(r);setFieldMap(r.fieldMap||{});}catch(e:any){Alert.alert('Validation failed',e?.response?.data?.message||e.message||'Could not validate file');}finally{setBusy(false);}};
 const commit=async()=>{if(!validation?.sessionId)return;setBusy(true);try{const r=await commitBulkImport(validation.sessionId,mode);Alert.alert('Import finished',`Created: ${r.created}\nUpdated: ${r.updated}\nSkipped: ${r.skipped}${r.failures?.length?`\nFailed: ${r.failures.length}`:''}${r.credentials?.length?`\n\nTemporary account passwords (copy securely now):\n${r.credentials.map((c:any)=>`${c.name} — ${c.email}: ${c.temporaryPassword}`).join('\n')}`:''}`);setValidation(null);setFile(null);}catch(e:any){Alert.alert('Import failed',e?.response?.data?.message||e.message||'Could not commit import');}finally{setBusy(false);}};
 const saveStaff=async()=>{if(!staff.name.trim()||!staff.email.trim()){Alert.alert('Required fields','Enter staff name and email.');return;}setBusy(true);try{const r=await createIndividualStaff(staff);Alert.alert('Account created',`Name: ${r.staff.name}\nEmail: ${r.staff.email}\nRole: ${r.staff.role}\nTemporary password: ${r.temporaryPassword}\n\nCopy and securely share this password now. It will not be shown again.`);setStaff({name:'',email:'',role:'TEACHER',phone:'',designation:'',department:'',employeeId:''});}catch(e:any){Alert.alert('Could not create staff',e?.response?.data?.message||e.message||'Please try again');}finally{setBusy(false);}};
 const exportFile=async(fmt:typeof formats[number])=>{setBusy(true);try{const filters:any={...(academicYearId?{academicYearId}:{})};Object.entries(exportFilters).forEach(([k,v])=>{if(typeof v==='string'&&v.trim())filters[k]=v.trim();});const data=await downloadBulkExport(moduleKey,fmt,filters);
 if(Platform.OS==='web'){
   const blob=data instanceof Blob?data:new Blob([data as BlobPart],{type:fmt==='csv'?'text/csv;charset=utf-8':fmt==='xlsx'?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/pdf'});
   const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`${moduleKey}-export-${Date.now()}.${fmt}`;anchor.style.display='none';document.body.appendChild(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500);
 }else{
   const bytes=data instanceof ArrayBuffer?new Uint8Array(data):data instanceof Uint8Array?data:new Uint8Array(await (data as Blob).arrayBuffer());
   let binary='';const chunkSize=0x8000;for(let i=0;i<bytes.length;i+=chunkSize)binary+=String.fromCharCode(...bytes.subarray(i,i+chunkSize));
  const base64=typeof btoa==='function'?btoa(binary):(()=>{const arrayBuffer=new ArrayBuffer(bytes.byteLength);new Uint8Array(arrayBuffer).set(bytes);return encode(arrayBuffer);})();
   const uri=`${FileSystem.cacheDirectory}${moduleKey}-export-${Date.now()}.${fmt}`;await FileSystem.writeAsStringAsync(uri,base64,{encoding:FileSystem.EncodingType.Base64});if(await Sharing.isAvailableAsync())await Sharing.shareAsync(uri);else Alert.alert('Export ready',uri);
 }}catch(e:any){Alert.alert('Export failed',e?.response?.data?.message||e.message||'Could not export data');}finally{setBusy(false);}};
 const Button=({title,onPress,disabled=false}:any)=><TouchableOpacity onPress={onPress} disabled={disabled||busy} style={{padding:12,backgroundColor:disabled?'#aab4c0':'#155eef',borderRadius:9,marginTop:8}}><Text style={{color:'#fff',fontWeight:'600',textAlign:'center'}}>{title}</Text></TouchableOpacity>;
 const allModules=[...(modules.importModules||[])]; const selected=allModules.find((m:any)=>m.key===moduleKey)||modules.exportModules?.find((m:any)=>m.key===moduleKey);
 return <>
 <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}}>
  <Text style={{fontSize:24,fontWeight:'700',color:'#182230'}}>Bulk Import & Export</Text><Text style={{color:'#667085',marginTop:5}}>Import partial spreadsheets safely, review validation, and export selected module data.</Text>
  <Text style={{fontWeight:'700',fontSize:16,marginTop:22}}>1. Select module</Text>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:8}}>{(modules.exportModules||[]).map((m:any)=><TouchableOpacity key={m.key} onPress={()=>{setModuleKey(m.key);setValidation(null);setFile(null);}} style={{paddingHorizontal:12,paddingVertical:9,borderRadius:20,backgroundColor:moduleKey===m.key?'#dbeafe':'#f2f4f7',borderWidth:moduleKey===m.key?1:0,borderColor:'#155eef'}}><Text style={{color:moduleKey===m.key?'#1849a9':'#344054'}}>{m.label}</Text></TouchableOpacity>)}</View>
  {moduleKey==='teachers'&&<View style={{marginTop:20,padding:14,borderWidth:1,borderColor:'#d0d5dd',borderRadius:12}}><Text style={{fontWeight:'700',fontSize:18}}>Add one teacher / staff member</Text><Text style={{color:'#667085',marginTop:4}}>Creates the staff record and login account together. A temporary password is generated automatically.</Text>{(['name','email','phone','designation','department','employeeId'] as const).map(k=><TextInput key={k} value={staff[k]} onChangeText={v=>setStaff((old:any)=>({...old,[k]:v}))} placeholder={k==='employeeId'?'Employee ID':k.charAt(0).toUpperCase()+k.slice(1)} autoCapitalize={k==='email'?'none':'words'} keyboardType={k==='email'?'email-address':'default'} style={{borderWidth:1,borderColor:'#d0d5dd',borderRadius:8,padding:11,marginTop:9}}/>)}{renderDropdown('Select staff role',staff.role,[{label:'Teacher',value:'TEACHER'},{label:'Administrative staff (ADMIN)',value:'ADMIN'}],v=>setStaff((old:any)=>({...old,role:v})))}<Button title='Create staff + login account' onPress={saveStaff}/></View>}
  <Text style={{fontWeight:'700',fontSize:16,marginTop:22}}>2. Import CSV / Excel</Text><Text style={{color:'#667085',marginTop:4}}>Supported fields for this module: {(selected?.fields||[]).join(', ')||'Loading…'}</Text>
  <Button title={file?`Selected: ${file.name}`:'Choose CSV or XLSX file'} onPress={chooseFile}/><Button title={validation?'Revalidate mapped columns':'Validate and detect columns'} onPress={validate} disabled={!file}/>
  {validation&&<View style={{marginTop:14,padding:12,borderRadius:10,borderWidth:1,borderColor:'#d0d5dd'}}><Text style={{fontWeight:'700',fontSize:16}}>Import preview</Text><Text style={{marginTop:6}}>Rows: {validation.totalRows} · Valid: {validation.validRows} · Invalid: {validation.invalidRows}</Text><Text style={{marginTop:6,fontWeight:'600'}}>Column mapping (change any detected mapping below)</Text>{(validation.headers||[]).map((header:string)=><View key={header} style={{marginTop:8,borderWidth:1,borderColor:'#eaecf0',borderRadius:8,paddingHorizontal:8}}><Text style={{fontSize:12,color:'#667085'}}>{header}</Text>{renderDropdown('Ignore this column',fieldMap[header]||'',[{label:'Ignore this column',value:''},...(validation.availableFields||[]).map((f:string)=>({label:f,value:f}))],v=>setFieldMap(old=>({...old,[header]:v})))}</View>)}<Text style={{marginTop:6}}>Ignored columns: {(validation.ignoredHeaders||[]).join(', ')||'None'}</Text><Text style={{marginTop:6}}>Missing create-required columns: {(validation.missingRequiredHeaders||[]).join(', ')||'None detected in headers'}</Text><Text style={{fontWeight:'600',marginTop:12}}>Import behavior</Text><View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{(['create','update','both'] as const).map(v=><TouchableOpacity key={v} onPress={()=>setMode(v)} style={{padding:9,borderRadius:8,backgroundColor:mode===v?'#dbeafe':'#f2f4f7'}}><Text>{v==='both'?'Create + Update':v==='create'?'Create only':'Update only'}</Text></TouchableOpacity>)}</View>{(validation.errors||[]).slice(0,10).map((e:any)=><Text key={e.rowNumber} style={{color:'#b42318',marginTop:6}}>Row {e.rowNumber}: {e.errors.join('; ')}</Text>)}<Button title="Commit valid rows" onPress={commit} disabled={!validation.validRows}/></View>}
  <Text style={{fontWeight:'700',fontSize:16,marginTop:24}}>3. Export</Text><Text style={{color:'#667085',marginTop:4}}>Exports are limited to your school. Use optional filters before exporting.</Text>
  <View style={{marginTop:10,padding:12,borderWidth:1,borderColor:'#d0d5dd',borderRadius:10}}>
   <Text style={{fontWeight:'700'}}>Export filters for {selected?.label||moduleKey}</Text>
   <Text style={{color:'#667085',fontSize:12,marginTop:3}}>Choose values from your school's dropdown lists. Leave a filter on “All” to include every matching record.</Text>
   {({students:['search','classId','sectionId','status','gender','category'],marks:['search','academicYearId','classId','examId','subjectId','studentId','isAbsent','isFinalized'],attendance:['search','academicYearId','dateFrom','dateTo','classId','sectionId','studentId','status'],transactions:['search','month','dateFrom','dateTo','classNumber','classId','sectionId','studentId','paymentMode','receiptNumber'],teachers:['search','role','isActive','department'],classes:['academicYearId','isCompleted'],sections:['classId'],subjects:['classId'],exams:['academicYearId','type'],examSubjects:['academicYearId','classId','examId','subjectId'],examTimetables:['academicYearId','classId','examId','subjectId']} as Record<string,string[]>)[moduleKey]?.map((k:string)=>{
    const label:Record<string,string>={search:'Name / admission number / email search',academicYearId:'Academic year',dateFrom:'From date (YYYY-MM-DD)',dateTo:'To date (YYYY-MM-DD)',classId:'Class',sectionId:'Section',studentId:'Student',examId:'Exam',subjectId:'Subject',isAbsent:'Absent?',isFinalized:'Finalized?',status:'Status',gender:'Gender',category:'Category',month:'Month (YYYY-MM)',classNumber:'Historical receipt class number',paymentMode:'Payment mode',receiptNumber:'Receipt number',role:'Staff role',isActive:'Active account?',department:'Department',isCompleted:'Class completed?',type:'Exam type'};
    let options:any[]|null=null;
    if(k==='academicYearId') options=filterOptions.academicYears||[];
    else if(k==='classId') options=(filterOptions.classes||[]).filter((o:any)=>!exportFilters.academicYearId||o.academicYearId===exportFilters.academicYearId);
    else if(k==='sectionId') options=(filterOptions.sections||[]).filter((o:any)=>!exportFilters.classId||o.classId===exportFilters.classId);
    else if(k==='studentId') options=(filterOptions.students||[]).filter((o:any)=>(!exportFilters.classId||o.classId===exportFilters.classId)&&(!exportFilters.sectionId||o.sectionId===exportFilters.sectionId));
    else if(k==='examId') options=(filterOptions.exams||[]).filter((o:any)=>!exportFilters.academicYearId||o.academicYearId===exportFilters.academicYearId);
    else if(k==='subjectId') options=(filterOptions.subjects||[]).filter((o:any)=>!exportFilters.classId||o.classId===exportFilters.classId);
    else if(k==='status') options=moduleKey==='attendance'?(filterOptions.attendanceStatuses||[]):(filterOptions.studentStatuses||[]);
    else if(k==='gender') options=filterOptions.genders||[];
    else if(k==='category') options=filterOptions.categories||[];
    else if(k==='role') options=filterOptions.roles||[];
    else if(k==='type') options=filterOptions.examTypes||[];
    else if(k==='paymentMode') options=filterOptions.paymentModes||[];
    else if(k==='classNumber') options=filterOptions.receiptClasses||[];
    else if(k==='department') options=filterOptions.departments||[];
    else if(['isAbsent','isFinalized','isActive','isCompleted'].includes(k)) options=filterOptions.booleanOptions||[];
    if(options!==null) return <View key={k} style={{borderWidth:1,borderColor:'#d0d5dd',borderRadius:8,marginTop:8,paddingHorizontal:8}}><Text style={{fontSize:12,color:'#667085',marginTop:5}}>{label[k]||k}</Text>{renderDropdown(`All ${label[k]||k}`,exportFilters[k]||'',[{label:`All ${label[k]||k}`,value:''},...options.map((o:any)=>({label:String(o.label),value:o.value}))],v=>setExportFilters((old:any)=>({...old,[k]:v,...(k==='classId'?{sectionId:'',studentId:''}:{}),...(k==='sectionId'?{studentId:''}:{})})))}</View>;
    return <TextInput key={k} value={exportFilters[k]||''} onChangeText={v=>setExportFilters((old:any)=>({...old,[k]:v,...((k==='month'&&v)?{dateFrom:'',dateTo:''}:{ }),...(((k==='dateFrom'||k==='dateTo')&&v)?{month:''}:{})}))} placeholder={`${label[k]||k} (optional)`} autoCapitalize="none" style={{borderWidth:1,borderColor:'#d0d5dd',borderRadius:8,padding:10,marginTop:8}}/>;
   })}
   <TouchableOpacity onPress={()=>setExportFilters({dateFrom:'',dateTo:'',month:'',classId:'',sectionId:'',paymentMode:'',role:'',isActive:'',status:'',gender:'',category:'',search:'',studentId:'',examId:'',subjectId:'',isAbsent:'',isFinalized:'',academicYearId:'',type:'',isCompleted:'',department:'',receiptNumber:'',classNumber:''})} style={{padding:10,marginTop:8,alignSelf:'flex-start',borderWidth:1,borderColor:'#d0d5dd',borderRadius:8}}><Text>Clear filters</Text></TouchableOpacity>
  </View>
  <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{formats.map(fmt=><TouchableOpacity key={fmt} onPress={()=>exportFile(fmt)} style={{padding:12,borderRadius:9,borderWidth:1,borderColor:'#d0d5dd',marginTop:8}}><Text style={{fontWeight:'600'}}>{fmt.toUpperCase()}</Text></TouchableOpacity>)}</View>
  {busy&&<View style={{marginTop:18,alignItems:'center'}}><ActivityIndicator/><Text style={{marginTop:6}}>Processing…</Text></View>}
  <Text style={{color:'#667085',fontSize:12,marginTop:24}}>Empty spreadsheet cells are ignored on updates. Finalized marks are protected. Review row errors before committing.</Text>
 </ScrollView>
 <Modal visible={!!dropdown} transparent animationType="fade" onRequestClose={()=>setDropdown(null)}>
  <TouchableOpacity activeOpacity={1} onPress={()=>setDropdown(null)} style={{flex:1,backgroundColor:'rgba(16,24,40,0.5)',justifyContent:'center',padding:20}}>
   <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={{backgroundColor:'#fff',borderRadius:14,padding:16,maxHeight:'75%',width:'100%',maxWidth:520,alignSelf:'center'}}>
    <Text style={{fontSize:17,fontWeight:'700',color:'#182230',marginBottom:10}}>{dropdown?.title||'Select an option'}</Text>
    <TextInput value={dropdownSearch} onChangeText={setDropdownSearch} placeholder="Search options..." autoCapitalize="none" style={{borderWidth:1,borderColor:'#d0d5dd',borderRadius:8,padding:10,marginBottom:8,color:'#101828'}}/>
    <ScrollView keyboardShouldPersistTaps="handled">
     {(dropdown?.options||[]).filter((option:any)=>String(option.label??'').toLowerCase().includes(dropdownSearch.trim().toLowerCase())).map((option:any,index:number)=><TouchableOpacity key={`${String(option.value)}-${index}`} onPress={()=>{dropdown?.onSelect?.(option.value);setDropdown(null);}} style={{paddingVertical:13,paddingHorizontal:10,borderBottomWidth:1,borderBottomColor:'#eaecf0',backgroundColor:String(option.value)===String(dropdown?.value)?'#eff8ff':'#fff'}}>
      <Text style={{color:String(option.value)===String(dropdown?.value)?'#1849a9':'#344054'}}>{option.label}</Text>
     </TouchableOpacity>)}
    </ScrollView>
    <TouchableOpacity onPress={()=>setDropdown(null)} style={{padding:12,marginTop:8,alignItems:'center'}}><Text style={{color:'#155eef',fontWeight:'600'}}>Cancel</Text></TouchableOpacity>
   </TouchableOpacity>
  </TouchableOpacity>
 </Modal></>;
}
