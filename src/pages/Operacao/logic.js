// Pure calculations. An absent or invalid value is not a zero.
export const number = value => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
export const get = (obj, ...paths) => {
  for (const path of paths) { const n = number(path.split('.').reduce((v,k)=>v?.[k],obj)); if(n!==null)return n; }
  return null;
};
export const unwrap = r => r?.data?.data ?? r?.data ?? r;
export const bugOpen = b => ['open','opened','aberto','nova','novo','pending','pendente','in_progress','in-progress','progress','in progress','em andamento','em_andamento','working','investigating','andamento'].includes(String(b?.status||'').toLowerCase().trim());
export const bugCritical = b => ['critical','critico','crítico','fatal','blocker','high'].includes(String(b?.severity||'').toLowerCase().trim());
export function buildOverview(sources){
  const d=sources.dashboard?.data, m=sources.mobility?.data, s=sources.services?.data, f=sources.finance?.data, b=sources.bugs?.data;
  const entries = [
    ['bugs','Bugs críticos em aberto',Array.isArray(b)?b.filter(x=>bugOpen(x)&&bugCritical(x)).length:null,'bugs','urgent','/bugs','Revisar ocorrências reportadas (lista retornada pela API).'],
    ['payment','Pagamentos sem conciliação',get(f,'total'),'finance','urgent','/finance/reconciliation','Conferir pagamentos aprovados ainda não aplicados.'],
    ['license','CNHs vencidas',get(m,'cnhVencidas'),'mobility','urgent','/mobilidade?aba=motoristas&filtro=aprovado','Documentos vencidos em perfis aprovados.'],
    ['vehicle','CRLVs vencidos',get(m,'crlvVencidos'),'mobility','urgent','/mobilidade?aba=motoristas&filtro=aprovado','Veículos aprovados com documento vencido.'],
    ['drivers','Motoristas em análise',get(m,'motoristasPendentes'),'mobility','review','/mobilidade?aba=motoristas&filtro=em_analise','Aprovação de mobilidade permanece manual.'],
    ['cities','Cidades / moto em análise',get(m,'cidadesMotoPendentes'),'mobility','review','/mobilidade?aba=cidades-moto&filtro=pendente','Conferir permissões municipais.'],
    ['slow','Buscas de motorista demoradas',get(m,'buscaDemorada'),'mobility','review','/mobilidade?aba=corridas','Solicitações em busca há 5 min ou mais.'],
    ['support','Atendimentos de suporte abertos',get(d,'support.abertos','support.openChats'),'dashboard','review','/conversations','Acompanhar conversas de suporte.'],
    ['proposals','Pedidos abertos sem proposta',get(s,'semProposta'),'services','review','/servicos?filtro=sem-proposta','Conferir oportunidades que aguardam retorno.'],
    ['licenseSoon','CNHs vencendo em 30 dias',get(m,'cnhAVencer'),'mobility','watch','/mobilidade?aba=motoristas&filtro=aprovado','Acompanhamento preventivo.'],
    ['vehicleSoon','CRLVs vencendo em 30 dias',get(m,'crlvAVencer'),'mobility','watch','/mobilidade?aba=motoristas&filtro=aprovado','Acompanhamento preventivo.'],
    ['noDriver','Corridas sem motorista em 24h',get(m,'semMotorista24h'),'mobility','watch','/mobilidade?aba=corridas&filtro=sem_motorista','Identificar regiões com baixa oferta.'],
    ['expired','Acessos profissionais expirados',get(d,'finance.acessosExpirados'),'dashboard','watch','/finance/users','Acompanhar renovação, sem alterar o acesso automaticamente.'],
  ].map(([id,title,value,source,priority,path,description])=>({id,title,value,source,priority,path,description,stale:sources[source]?.status!=='ok'}));
  return {entries, active:entries.filter(x=>x.value>0), unknown:entries.filter(x=>x.value===null), metrics:[
    {label:'Usuários cadastrados',value:get(d,'users.total'),source:'dashboard',path:'/users'},
    {label:'Novos usuários hoje',value:get(d,'users.novosHoje','users.newToday'),source:'dashboard',path:'/users'},
    {label:'Pedidos abertos',value:get(s,'abertos'),source:'services',path:'/servicos'},
    {label:'Solicitações ativas',value:get(m,'viagensAtivas'),source:'mobility',path:'/mobilidade?aba=corridas'},
    {label:'Receita do mês',value:get(d,'finance.receitaMes'),currency:true,source:'dashboard',path:'/finance'},
    {label:'Prestadores ativos',value:get(d,'marketplace.prestadoresAtivos','marketplace.activeProviders'),source:'dashboard',path:'/users'},
  ]};
}
export function scheduleStatus(data){
 if(!data)return 'Não confirmado';
 if(data.bloqueioAmbiente)return 'Bloqueada no servidor';
 const active=data.registros?.find(x=>x.uf==='*')?.ativo??data.padrao?.ativo;
 return active===true?'Ligada':active===false?'Desligada':'Não confirmado';
}
