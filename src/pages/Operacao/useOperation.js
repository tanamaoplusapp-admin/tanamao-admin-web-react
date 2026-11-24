import {createContext,useContext,useCallback,useEffect,useRef,useState} from 'react';
import API from '../../services/api';
import {unwrap} from './logic';
export const SOURCES = [
 ['dashboard','Indicadores gerais','/central/dashboard'],
 ['services','Serviços e oportunidades','/pedidos-abertos/admin/resumo'],
 ['mobility','Operação de mobilidade','/admin/mobilidade/operacao/resumo'],
 ['schedule','Tarifa dinâmica','/admin/mobilidade/tarifas/dinamica'],
 ['finance','Conciliação financeira','/admin/finance/reconciliation'],
 ['bugs','Relatos de bugs','/admin/bugs'],
];
export const OperationContext=createContext(null);
export const useOperation=()=>useContext(OperationContext);
export function useOperationState(){
 const [sources,setSources]=useState({}),[loading,setLoading]=useState(false),[auto,setAuto]=useState(()=>localStorage.getItem('tanamao-admin-poll')!=='off'),[last,setLast]=useState(null);
 const running=useRef(null),alive=useRef(false);
 const refresh=useCallback(async()=>{
   if(running.current)return;
   const controller=new AbortController();running.current=controller;setLoading(true);
   const results=await Promise.allSettled(SOURCES.map(async([id,,url])=>{
     const response=await API.get(url,{signal:controller.signal,timeout:18000});
     let data=unwrap(response.data);
     if(id==='bugs')data=Array.isArray(data)?data:data?.items??data?.bugs;
     if(!data || data.ok===false || typeof data!=='object' || (id==='bugs'&&!Array.isArray(data)))throw new Error('Resposta inesperada');
     return data;
   }));
   if(controller.signal.aborted||!alive.current)return;
   const at=new Date();setSources(prev=>Object.fromEntries(SOURCES.map(([id],i)=>{
     const r=results[i];return [id,r.status==='fulfilled'?{status:'ok',data:r.value,at}:{status:'error',data:prev[id]?.data,at:prev[id]?.at,http:r.reason?.response?.status}];
   })));setLast(at);setLoading(false);running.current=null;
 },[]);
 useEffect(()=>{alive.current=true;refresh();return()=>{alive.current=false;running.current?.abort();running.current=null;};},[refresh]);
 useEffect(()=>{localStorage.setItem('tanamao-admin-poll',auto?'on':'off');if(!auto)return;const tick=()=>{if(document.visibilityState==='visible')refresh();};const interval=setInterval(tick,60000);document.addEventListener('visibilitychange',tick);return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',tick);};},[auto,refresh]);
 return {sources,loading,auto,setAuto,last,refresh};
}
