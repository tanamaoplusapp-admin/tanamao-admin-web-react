import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getMobilityProfiles, getMobilityProfile, reviewMobilityCnh, reviewMobilityProfile,
  reviewMobilityVehicle, downloadMobilityDocument, getMobilityTariffs,
  saveMobilityTariff, seedMobilityTariffs, getMobilityJobs,
  cancelMobilityJob, unlockMobilityPin, getMotoPolicies, reviewMotoPolicy, mobilityError,
} from '../../services/mobilidadeAdmin';
import {
  SERVICES, STATUS_PROFILE, STATUS_JOB, getServiceLabel, getStatusLabel,
  money, dateLabel, dateOnly, centsInput, inputCents, shortLocation, shortId,
} from './utils';
import './Mobilidade.css';

const TABS = [
  ['resumo', 'Visão geral'], ['motoristas', 'Motoristas'],
  ['tarifas', 'Tarifas'], ['cidades-moto', 'Cidades / Moto'], ['corridas', 'Corridas e entregas'], ['demanda', 'Demanda'],
];
const POSITIVE = new Set(['aprovado', 'concluida', 'confirmado_cliente']);
const NEGATIVE = new Set(['reprovado', 'suspenso', 'cancelada', 'contestado']);

function Status({ value }) {
  const color = POSITIVE.has(value) ? 'good' : NEGATIVE.has(value) ? 'bad' : 'neutral';
  return <span className={`mam-status mam-status--${color}`}>{getStatusLabel(value)}</span>;
}
function Notice({ message, variant = 'error' }) {
  return message ? <div className={`mam-notice mam-notice--${variant}`} role="status">{message}</div> : null;
}
function Empty({ children }) {
  return <div className="mam-empty">{children}</div>;
}
function Field({ label, children, hint }) {
  return <label className="mam-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function MobilidadeAdmin() {
  const [params, setParams] = useSearchParams();
  const maybeTab = params.get('aba');
  const tab = TABS.some(([key]) => key === maybeTab) ? maybeTab : 'resumo';
  const changeTab = key => setParams({ aba: key });

  return <section className="mam-root">
    <div className="mam-heading">
      <div>
        <p className="mam-eyebrow">CENTRAL DE OPERAÇÕES · TANAMÃO+</p>
        <h1>Mobilidade <span className="mam-plus">+</span></h1>
        <p className="mam-subtitle">Motoristas, aprovações, tarifas e viagens em um só lugar.</p>
      </div>
      <span className="mam-headchip">Corridas · Entregas · Fretes</span>
    </div>
    <div className="mam-hero">
      <div className="mam-hero-symbol" aria-hidden="true">✦</div>
      <div><strong>Controle operacional</strong><p>O Tanamão+ calcula os preços. O pagamento da viagem é recebido diretamente pelo motorista. Os planos continuam no sistema financeiro existente.</p></div>
    </div>
    <div className="mam-tabs" role="tablist" aria-label="Seções de Mobilidade">
      {TABS.map(([key, label]) => <button key={key} role="tab" type="button" aria-selected={tab === key}
        className={`mam-tab ${tab === key ? 'mam-tab--active' : ''}`} onClick={() => changeTab(key)}>{label}</button>)}
    </div>
    {tab === 'resumo' && <Resumo go={changeTab} />}
    {tab === 'motoristas' && <Motoristas />}
    {tab === 'tarifas' && <Tarifas />}
    {tab === 'cidades-moto' && <CidadesMoto />}
    {tab === 'corridas' && <Corridas />}
    {tab === 'demanda' && <Demanda />}
  </section>;
}

function Resumo({ go }) {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    const settled = await Promise.allSettled([
      getMobilityProfiles({ status: 'em_analise' }),
      getMobilityProfiles({ status: 'aprovado' }),
      getMobilityTariffs(),
      getMobilityJobs(),
    ]);
    const next = {}, nextErrors = [];
    ['pendentes', 'aprovados', 'tarifas', 'viagens'].forEach((key, index) => {
      const item = settled[index];
      if (item.status === 'fulfilled') next[key] = item.value;
      else nextErrors.push(mobilityError(item.reason));
    });
    setData(next);
    setErrors([...new Set(nextErrors)]);
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const jobs = data.viagens?.solicitacoes || [];
  const activeJobs = jobs.filter(x => ['procurando', 'ofertada', 'aceita', 'no_local', 'em_andamento'].includes(x.status));
  const counts = [
    { title: 'Motoristas em análise', number: data.pendentes?.total, info: 'Aguardando decisão administrativa', click: 'motoristas' },
    { title: 'Motoristas aprovados', number: data.aprovados?.total, info: 'Perfis aprovados (não necessariamente online)', click: 'motoristas' },
    { title: 'Tarifas ativas', number: data.tarifas?.tarifas?.filter(x => x.ativo).length, info: 'Modalidades e regiões com preço cadastrado', click: 'tarifas' },
    { title: 'Viagens ativas', number: data.viagens ? activeJobs.length : undefined, info: 'Na amostra das 100 solicitações mais recentes', click: 'corridas' },
  ];
  return <>
    <div className="mam-toolbar"><div><h2>Visão geral</h2><p>Dados consultados diretamente no backend</p></div><button className="mam-btn mam-btn--quiet" onClick={refresh} disabled={loading}>↻ Atualizar</button></div>
    {errors.map(err => <Notice key={err} message={err} />)}
    <div className="mam-stats">{counts.map(x => <button key={x.title} className="mam-stat" onClick={() => go(x.click)}>
      <span>{x.title}</span><strong>{x.number === undefined ? (loading ? '…' : '—') : x.number}</strong><small>{x.info}</small></button>)}</div>
    <div className="mam-two-col">
      <div className="mam-card"><div className="mam-card-title"><h3>Próximas ações</h3></div>
        <p>Revise CNH, foto, veículo e modalidades antes de liberar um motorista.</p>
        <button className="mam-linkbtn" onClick={() => go('motoristas')}>Conferir motoristas →</button>
      </div>
      <div className="mam-card"><div className="mam-card-title"><h3>Preços por modalidade</h3></div>
        <p>Cadastre corridas de carro e moto separadamente; a tarifa de moto pode ser mais acessível. A cobrança aos passageiros não passa pelo Tanamão+.</p>
        <button className="mam-linkbtn" onClick={() => go('tarifas')}>Gerenciar tarifas →</button>
      </div>
    </div>
    <p className="mam-help">Os indicadores de viagens usam no máximo as últimas 100 solicitações. Eles não representam um relatório financeiro consolidado.</p>
  </>;
}

function Motoristas() {
  const [status, setStatus] = useState('em_analise');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [approvedServices, setApprovedServices] = useState([]);
  const [showCnh, setShowCnh] = useState(false);
  const [placasConferidas, setPlacasConferidas] = useState({});
  const [previews, setPreviews] = useState({});
  const previewUrls = useRef(new Set());
  useEffect(() => () => { for (const url of previewUrls.current) URL.revokeObjectURL(url); }, []);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await getMobilityProfiles({ status, page }); setRows(r.perfis || []); setTotal(r.total || 0); setError(''); }
    catch (e) { setError(mobilityError(e)); setRows([]); }
    finally { setLoading(false); }
  }, [status, page]);
  useEffect(() => { load(); }, [load]);

  const open = async (profileId, keepSuccess = false) => {
    setAction('abrindo'); setError(''); if (!keepSuccess) setSuccess('');
    try {
      const r = await getMobilityProfile(profileId);
      setDetail(r);
      setMotivo(''); setShowCnh(false); setPlacasConferidas({}); setPreviews({});
      setApprovedServices(r.perfil?.servicosAprovados?.length ? r.perfil.servicosAprovados : r.perfil?.servicosSolicitados || []);
    } catch (e) { setError(mobilityError(e)); }
    finally { setAction(''); }
  };
  const review = async (kind, targetId, decision) => {
    if (kind === 'veiculo' && decision === 'aprovar' && !placasConferidas[targetId]) { setError('Confira a foto frontal com a placa e o CRLV e marque a confirmação antes de aprovar.'); return; }
    if (decision !== 'aprovar' && !motivo.trim()) { setError('Informe um motivo para reprovar, suspender ou pedir reenvio.'); return; }
    const aviso = kind === 'perfil' && decision === 'aprovar' ? 'Aprovar administrativamente este cadastro e as modalidades selecionadas? Documentos pendentes deixam o perfil restrito, SEM poder operar corridas reais antes da revisão manual.' : `Confirma a decisão: ${decision.replaceAll('_', ' ')}? Esta ação fica registrada no backend.`;
    if (!window.confirm(aviso)) return;
    setError(''); setSuccess(''); setAction(`${kind}-${targetId}`);
    try {
      const body = { decisao: decision, motivo: motivo.trim() };
      if (kind === 'perfil' && decision === 'aprovar') body.servicosAprovados = approvedServices;
      if (kind === 'veiculo' && decision === 'aprovar') body.placaConferida = true;
      if (kind === 'cnh') await reviewMobilityCnh(targetId, body);
      if (kind === 'perfil') await reviewMobilityProfile(targetId, body);
      if (kind === 'veiculo') await reviewMobilityVehicle(targetId, body);
      setSuccess('Análise registrada com sucesso.');
      setMotivo(''); setPlacasConferidas({});
      await Promise.all([load(), detail?.perfil?._id ? open(detail.perfil._id, true) : Promise.resolve()]);
    } catch (e) { setError(mobilityError(e)); }
    finally { setAction(''); }
  };
  const download = async doc => {
    setError(''); setAction('documento');
    try {
      const blob = await downloadMobilityDocument(doc._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mobilidade-${doc.tipo || 'documento'}-${String(doc._id).slice(-6)}.${doc.mime === 'application/pdf' ? 'pdf' : doc.mime === 'image/png' ? 'png' : 'jpg'}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) { setError(mobilityError(e)); }
    finally { setAction(''); }
  };

  const previewDocumento = async doc => {
    setError(''); setAction('visualizar');
    try {
      const blob = await downloadMobilityDocument(doc._id);
      const url = URL.createObjectURL(blob); previewUrls.current.add(url);
      setPreviews(old => ({...old, [doc._id]: {url, mime:doc.mime}}));
    } catch(e) { setError(mobilityError(e)); }
    finally { setAction(''); }
  };

  const p = detail?.perfil;
  return <>
    <div className="mam-toolbar"><div><h2>Motoristas e aprovações</h2><p>Documentação verificada manualmente</p></div><button className="mam-btn mam-btn--quiet" onClick={load} disabled={loading}>↻ Atualizar</button></div>
    <Notice message={error} /><Notice message={success} variant="success" />
    <div className="mam-card">
      <div className="mam-filterrow"><Field label="Situação do cadastro"><select value={status} onChange={e => { setStatus(e.target.value); setPage(1); setDetail(null); }}>
        {STATUS_PROFILE.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
        <p>{loading ? 'Consultando…' : `${total} cadastro(s) encontrado(s)`}</p></div>
      <div className="mam-list">{rows.map(item => <button type="button" key={item._id} onClick={() => open(item._id)} className={`mam-rowbtn ${p?._id === item._id ? 'mam-rowbtn--selected' : ''}`}>
        <span className="mam-row-main"><strong>Motorista {shortId(item.userId)}</strong><small>{[item.cidadeBase, item.ufBase].filter(Boolean).join(' / ') || 'Localidade não informada'} · {item.servicosSolicitados?.length || 0} modalidade(s)</small></span>
        <Status value={item.status} /><span className="mam-chevron">›</span>
      </button>)}</div>
      {!rows.length && !loading && <Empty>Nenhum cadastro nessa situação.</Empty>}
      <div className="mam-pagination"><button className="mam-btn mam-btn--quiet" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Anterior</button>
        <span>Página {page} de {Math.max(1, Math.ceil(total / 30))}</span>
        <button className="mam-btn mam-btn--quiet" disabled={page * 30 >= total || loading} onClick={() => setPage(p => p + 1)}>Próxima</button></div>
    </div>

    {p && <div className="mam-card mam-detail">
      <div className="mam-card-title"><div><h3>Análise do motorista</h3><p>{detail.nomeMotorista || 'Motorista'} · <Status value={p.status} /></p></div>
        <button className="mam-btn mam-btn--quiet" onClick={() => setDetail(null)}>Fechar</button></div>
      <div className="mam-idpanel">
        {detail.fotoMotorista ? <img className="mam-driverphoto" src={detail.fotoMotorista} alt="Foto enviada pelo motorista" referrerPolicy="no-referrer" /> : <div className="mam-photoempty">Foto ausente</div>}
        <div><strong>Conferência de identidade</strong><p>Compare o rosto com a CNH antes de aprovar. Para operar corridas reais, o servidor também exige CRLV, foto frontal com placa e veículo aprovado.</p>
          {p.status === 'aprovado' && !detail.fotoConfere && <Notice message="A foto mudou após a aprovação. É necessária uma nova conferência." />}
        </div>
      </div>
      {p.aprovacaoRestrita && <Notice message="Cadastro aprovado administrativamente com restrição: faltam verificações para operar corridas reais." />}
      <div className="mam-detailgrid">
        <div><span>CNH</span><strong><Status value={p.cnh?.status || 'ausente'} /></strong></div>
        <div><span>Categoria / EAR</span><strong>{p.cnh?.categoria || '—'} / {p.cnh?.ear ? 'Sim' : 'Não'}</strong></div>
        <div><span>Validade</span><strong>{dateOnly(p.cnh?.validade)}</strong></div>
        <div><span>Número CNH</span><strong>{showCnh ? (p.cnh?.numero || 'Não disponível') : '••••••••'} <button className="mam-inline" type="button" onClick={() => setShowCnh(x => !x)}>{showCnh ? 'Ocultar' : 'Conferir'}</button></strong></div>
      </div>
      <div className="mam-section"><h4>Documentos privados</h4>
        <div className="mam-chips">{(detail.documentos || []).map(doc => <button className="mam-btn mam-btn--quiet" disabled={!!action} key={doc._id} onClick={() => download(doc)}>↓ {doc.tipo}{doc.mime === 'application/pdf' ? ' · PDF digital' : ''}</button>)}
          {!detail.documentos?.length && <p>Nenhum documento enviado.</p>}</div></div>
      <Field label="Motivo da decisão (obrigatório para negativa)"><textarea rows="2" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Descreva a justificativa para o profissional…" maxLength={500} /></Field>
      <div className="mam-actionrow">
        <button className="mam-btn" disabled={!!action} onClick={() => review('cnh', p._id, 'aprovar')}>Aprovar CNH</button>
        <button className="mam-btn mam-btn--quiet" disabled={!!action} onClick={() => review('cnh', p._id, 'solicitar_reenvio')}>Pedir reenvio</button>
        <button className="mam-btn mam-btn--danger" disabled={!!action} onClick={() => review('cnh', p._id, 'reprovar')}>Reprovar CNH</button>
      </div>
      <div className="mam-section"><h4>Veículos</h4>
        {(detail.veiculos || []).map(v => {
          const docs=(detail.documentos||[]).filter(d=>String(d.veiculoId||'')===String(v._id))
            .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
          const crlv=docs.find(d=>d.tipo==='crlv');
          const tipoFoto=v.tipo==='moto'?'foto_traseira_placa':'foto_frente_placa';
          const foto=docs.find(d=>d.tipo===tipoFoto);
          const desde=new Date(v.dadosAtualizadosEm||0).getTime();
          const crlvAtual=!!crlv&&new Date(crlv.createdAt).getTime()>=desde;
          const fotoAtual=!!foto&&new Date(foto.createdAt).getTime()>=desde;
          const podeAprovar=crlvAtual&&fotoAtual&&!!placasConferidas[v._id];
          return <div className="mam-vehicle" key={v._id}>
            <div><strong>{[v.marca, v.modelo].filter(Boolean).join(' ') || v.tipo} · {v.placa || 'Sem placa'}</strong>
              <p>{v.tipo} · {v.ano || '—'} · <Status value={v.status} /></p>
              <p><strong>Proprietário no CRLV:</strong> {v.proprietarioTerceiro ? 'terceiro (não impede a análise)' : 'não informado como terceiro'}</p>
              {v.placaConferidaEm && <p>Placa conferida pelo administrador em {dateLabel(v.placaConferidaEm)}.</p>}
            </div>
            <div className="mam-section">
              <h4>Conferência obrigatória da placa e do CRLV</h4>
              <p>Compare a placa visível na foto {v.tipo==='moto'?'traseira':'frontal'} com a placa do CRLV e do cadastro: <strong>{v.placa}</strong>. Confira também marca, modelo e características. Estar em nome de terceiros, por si só, não reprova o veículo.</p>
              <div className="mam-chips">
                {foto ? <button type="button" className="mam-btn mam-btn--quiet" disabled={!!action} onClick={()=>previewDocumento(foto)}>{v.tipo==='moto'?'Ver traseira da moto e placa':'Ver foto frontal com placa'} {fotoAtual?'':'(antiga)'}</button> : <span>Foto com placa: não enviada</span>}
                {crlv ? <button type="button" className="mam-btn mam-btn--quiet" disabled={!!action} onClick={()=>previewDocumento(crlv)}>Ver CRLV {crlvAtual?'':'(antigo)'}</button> : <span>CRLV: não enviado</span>}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:12}}>
                {[foto,crlv].filter(Boolean).map(doc=>previews[doc._id] && <div key={doc._id} style={{flex:'1 1 260px',minWidth:0}}>
                  <strong>{doc.tipo==='crlv'?'CRLV':'Foto do veículo com placa'}</strong>
                  {previews[doc._id].mime==='application/pdf'
                    ? <iframe title="CRLV para conferência" src={previews[doc._id].url} style={{width:'100%',height:320,border:'1px solid #ccc',borderRadius:8}} />
                    : <img alt={doc.tipo==='crlv'?'Imagem do CRLV':'Foto do veículo mostrando a placa'} src={previews[doc._id].url} style={{display:'block',width:'100%',maxHeight:370,objectFit:'contain',borderRadius:8,border:'1px solid #ccc'}} />}
                </div>)}
              </div>
              <label className="mam-check" style={{display:'flex',alignItems:'flex-start',gap:10,marginTop:12}}>
                <input type="checkbox" disabled={!crlvAtual||!fotoAtual||!!action} checked={!!placasConferidas[v._id]}
                  onChange={e=>setPlacasConferidas(prev=>({...prev,[v._id]:e.target.checked}))} />
                <span>Conferi pessoalmente a foto {v.tipo==='moto'?'traseira':'frontal'}, a placa <strong>{v.placa}</strong> e o CRLV. Confirmo que se referem ao mesmo veículo.</span>
              </label>
            </div>
            <div className="mam-chips"><button className="mam-btn" disabled={!!action||!podeAprovar} onClick={() => review('veiculo', v._id, 'aprovar')}>Aprovar veículo</button>
              <button className="mam-btn mam-btn--quiet" disabled={!!action} onClick={() => review('veiculo', v._id, 'reprovar')}>Reprovar</button>
              <button className="mam-btn mam-btn--danger" disabled={!!action} onClick={() => review('veiculo', v._id, 'suspender')}>Suspender</button></div>
          </div>;
        })}
        {!detail.veiculos?.length && <Empty>O motorista ainda não cadastrou veículos.</Empty>}
      </div>
      <div className="mam-section"><h4>Modalidades autorizadas</h4><p>Marque apenas os serviços que poderão ser oferecidos ao motorista.</p>
        <div className="mam-options">{(p.servicosSolicitados || []).map(s => <label key={s} className="mam-check"><input type="checkbox" checked={approvedServices.includes(s)}
          onChange={e => setApprovedServices(list => e.target.checked ? [...list, s] : list.filter(x => x !== s))} /> {getServiceLabel(s)}</label>)}</div>
        <div className="mam-actionrow"><button className="mam-btn" disabled={!!action || !approvedServices.length} onClick={() => review('perfil', p._id, 'aprovar')}>Aprovar perfil e modalidades</button>
        <button className="mam-btn mam-btn--danger" disabled={!!action} onClick={() => review('perfil', p._id, 'suspender')}>Suspender perfil</button></div>
      </div>
      <p className="mam-help">Ordem recomendada: verificar foto e CNH, conferir foto frontal e placa com o CRLV, aprovar os veículos e só então aprovar as modalidades. O backend registra as decisões.</p>
    </div>}
  </>;
}

const BASE_TARIFF = {
  servico: 'corrida_carro', cidade: 'ponta pora', uf: 'MS',
  bandeirada: '5,00', porKm: '2,00', porMinuto: '0,20', porKg: '0,00', porM3: '0,00', minimo: '12,00',
  ativo: true, dinamicaAtiva: false,
};
const MONEY_FIELDS = [
  ['bandeirada', 'Bandeirada (R$)'], ['porKm', 'Por quilômetro (R$)'],
  ['porMinuto', 'Por minuto (R$)'], ['minimo', 'Preço mínimo (R$)'],
  ['porKg', 'Por kg (R$)'], ['porM3', 'Por m³ (R$)'],
];
function Tarifas() {
  const [tarifas, setTarifas] = useState([]);
  const [form, setForm] = useState(BASE_TARIFF);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const refresh = useCallback(async () => {
    try { const r = await getMobilityTariffs(); setTarifas(r.tarifas || []); setError(''); }
    catch (e) { setError(mobilityError(e)); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const setField = (k, v) => setForm(old => ({ ...old, [k]: v }));
  const loadTariff = t => {
    setEditing(true); setError(''); setSuccess('');
    setForm({ servico: t.servico, cidade: t.cidade || '*', uf: t.uf || '*',
      ...Object.fromEntries(MONEY_FIELDS.map(([name]) => [name, centsInput(t[`${name}Centavos`])])),
      ativo: !!t.ativo, dinamicaAtiva: !!t.dinamicaAtiva });
    document.getElementById('mam-tariff-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      const body = { servico: form.servico, cidade: (form.cidade || '').trim(), uf: (form.uf || '').trim().toUpperCase(), ativo: !!form.ativo, dinamicaAtiva: !!form.dinamicaAtiva };
      for (const [name] of MONEY_FIELDS) body[`${name}Centavos`] = inputCents(form[name]);
      if (!body.cidade || !body.uf) throw new Error('Informe a cidade e a UF, ou use * para uma tarifa geral.');
      if (!['corrida_carro', 'corrida_moto'].includes(body.servico)) body.dinamicaAtiva = !!form.dinamicaAtiva;
      if (!body.bandeiradaCentavos && !body.porKmCentavos && !body.porMinutoCentavos) throw new Error('Informe um valor de bandeirada, km ou minuto.');
      await saveMobilityTariff(body);
      setSuccess('Tarifa salva no backend. Já pode ser usada em cotações dessa região, conforme as regras do módulo.');
      setEditing(false); await refresh();
    } catch (e) { setError(e instanceof Error && !e.response ? e.message : mobilityError(e)); }
    finally { setBusy(false); }
  };
  const install = async () => {
    if (!window.confirm('Instalar tarifas ILUSTRATIVAS para Ponta Porã e Pedro Juan Caballero? Podem ficar ativas e afetar cotações reais. Confirma?')) return;
    setBusy(true); setError(''); setSuccess('');
    try { const r = await seedMobilityTariffs(); setSuccess(`${r.adicionadas} tarifa(s) inicial(is) cadastrada(s), sem sobrescrever as existentes. Revise os valores antes de atender clientes reais.`); await refresh(); }
    catch (e) { setError(mobilityError(e)); } finally { setBusy(false); }
  };
  const moto = tarifas.find(t => t.servico === 'corrida_moto' && t.ativo && t.cidade === form.cidade && t.uf === form.uf);
  const carro = tarifas.find(t => t.servico === 'corrida_carro' && t.ativo && t.cidade === form.cidade && t.uf === form.uf);
  const alertPrice = moto && carro && (Number(moto.porKmCentavos) >= Number(carro.porKmCentavos) || Number(moto.minimoCentavos) >= Number(carro.minimoCentavos));
  return <>
    <div className="mam-toolbar"><div><h2>Tarifas de mobilidade</h2><p>Valores utilizados no cálculo automático de corridas, entregas e fretes</p></div>
      <button className="mam-btn mam-btn--quiet" onClick={refresh} disabled={busy}>↻ Atualizar</button></div>
    <Notice message={error} /><Notice message={success} variant="success" />
    <div className="mam-two-col mam-two-col--form">
      <form className="mam-card" id="mam-tariff-form" onSubmit={submit}>
        <div className="mam-card-title"><div><h3>{editing ? 'Editar tarifa' : 'Cadastrar tarifa'}</h3><p>Defina o preço por modalidade e cidade.</p></div></div>
        <div className="mam-gridform">
          <Field label="Modalidade"><select value={form.servico} onChange={e => setField('servico', e.target.value)}>{SERVICES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
          <Field label="Cidade"><input value={form.cidade} onChange={e => setField('cidade', e.target.value)} required placeholder="Ponta Porã" /></Field>
          <Field label="UF ou país" hint="MS para Ponta Porã; PY para Pedro Juan Caballero."><input value={form.uf} onChange={e => setField('uf', e.target.value.toUpperCase())} required maxLength={2} placeholder="MS" /></Field>
          {MONEY_FIELDS.map(([key, label]) => <Field key={key} label={label}><input inputMode="decimal" value={form[key]} onChange={e => setField(key, e.target.value)} required /></Field>)}
        </div>
        <div className="mam-options mam-options--stack">
          <label className="mam-check"><input type="checkbox" checked={form.ativo} onChange={e => setField('ativo', e.target.checked)} /> Tarifa ativa</label>
          <label className="mam-check"><input type="checkbox" checked={form.dinamicaAtiva} onChange={e => setField('dinamicaAtiva', e.target.checked)} /> Permitir preço dinâmico baseado em solicitações reais</label>
        </div>
        <p className="mam-help">O backend determina o valor final por distância, tempo e regras tarifárias. O pagamento da viagem permanece direto ao motorista. Moto deve ter tarifa mais acessível que carro.</p>
        <div className="mam-actionrow"><button type="submit" className="mam-btn" disabled={busy}>{busy ? 'Salvando…' : 'Salvar tarifa'}</button>
          <button type="button" className="mam-btn mam-btn--quiet" onClick={() => { setForm(BASE_TARIFF); setEditing(false); }}>Limpar formulário</button></div>
      </form>
      <div className="mam-stack">
        <div className="mam-card"><h3>Região de fronteira</h3><p>Você pode cadastrar valores para <strong>Ponta Porã / MS</strong> e <strong>Pedro Juan Caballero / PY</strong>. As duas cidades são tratadas como região integrada nas regras do backend, mas os preços continuam configuráveis.</p>
          <div className="mam-chips"><button className="mam-btn mam-btn--quiet" onClick={() => { setForm(old => ({ ...old, cidade: 'ponta pora', uf: 'MS' })); }}>Ponta Porã</button>
          <button className="mam-btn mam-btn--quiet" onClick={() => { setForm(old => ({ ...old, cidade: 'pedro juan caballero', uf: 'PY' })); }}>Pedro Juan Caballero</button></div></div>
        <div className="mam-card"><h3>Valores de exemplo</h3><p>Os exemplos não são preços oficiais. Não os instale sem conferir, pois podem ficar disponíveis para cotações.</p>
          <button className="mam-btn mam-btn--outline" disabled={busy} onClick={install}>Criar tarifas iniciais de teste</button></div>
        {alertPrice && <Notice message="Atenção: existe tarifa de moto igual ou superior à de carro na região selecionada. Revise os preços para manter moto mais acessível." variant="warning" />}
      </div>
    </div>
    <div className="mam-card"><div className="mam-card-title"><div><h3>Tarifas cadastradas</h3><p>{tarifas.length} combinação(ões) de região e modalidade</p></div></div>
      {tarifas.length ? <div className="mam-tablewrap"><table className="mam-table"><thead><tr><th>Modalidade</th><th>Região</th><th>Bandeirada</th><th>Por km</th><th>Mínimo</th><th>Dinâmica</th><th>Status</th><th></th></tr></thead><tbody>
        {tarifas.map(t => <tr key={t._id}><td><strong>{getServiceLabel(t.servico)}</strong></td><td>{t.cidade} / {t.uf}</td><td>{money(t.bandeiradaCentavos)}</td><td>{money(t.porKmCentavos)}</td><td>{money(t.minimoCentavos)}</td>
          <td>{t.dinamicaAtiva ? 'Permitida' : 'Desligada'}</td><td><span className={`mam-status ${t.ativo ? 'mam-status--good' : 'mam-status--bad'}`}>{t.ativo ? 'Ativa' : 'Inativa'}</span></td><td><button className="mam-inline" onClick={() => loadTariff(t)}>Editar</button></td></tr>)}
      </tbody></table></div> : <Empty>Nenhuma tarifa foi cadastrada. Preencha o formulário ou use as tarifas iniciais de teste com cautela.</Empty>}
    </div>
  </>;
}

function Corridas() {
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const data = await getMobilityJobs(status); setRows(data.solicitacoes || []); setError(''); }
    catch (e) { setError(mobilityError(e)); setRows([]); }
    finally { setLoading(false); }
  }, [status]);
  useEffect(() => { refresh(); }, [refresh]);
  const cancel = async () => {
    if (!selected) return;
    if (!reason.trim()) { setError('Informe o motivo do cancelamento administrativo.'); return; }
    if (!window.confirm('Cancelar esta viagem? A ação é registrada e avisa os participantes.')) return;
    setBusy(true); setError(''); setSuccess('');
    try { await cancelMobilityJob(selected._id, reason.trim()); setSelected(null); setReason(''); setSuccess('Viagem cancelada.'); await refresh(); }
    catch (e) { setError(mobilityError(e)); } finally { setBusy(false); }
  };
  const resetPin = async () => {
    if (!selected || !window.confirm('Redefinir o bloqueio por tentativas de PIN desta viagem?')) return;
    setBusy(true); setError(''); setSuccess('');
    try { await unlockMobilityPin(selected._id); setSuccess('Contador de tentativas do PIN desbloqueado.'); }
    catch (e) { setError(mobilityError(e)); } finally { setBusy(false); }
  };
  const terminal = selected && ['cancelada', 'concluida', 'sem_motorista'].includes(selected.status);
  return <>
    <div className="mam-toolbar"><div><h2>Corridas, entregas e fretes</h2><p>Últimas 100 solicitações registradas no backend</p></div><button className="mam-btn mam-btn--quiet" onClick={refresh} disabled={loading}>↻ Atualizar</button></div>
    <Notice message={error} /><Notice message={success} variant="success" />
    <div className="mam-card"><div className="mam-filterrow"><Field label="Situação da viagem"><select value={status} onChange={e => { setStatus(e.target.value); setSelected(null); }}>
      {STATUS_JOB.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field><p>{loading ? 'Consultando…' : `${rows.length} viagem(ns) exibida(s)`}</p></div>
      <div className="mam-tablewrap"><table className="mam-table"><thead><tr><th>Solicitação</th><th>Tipo</th><th>Valor calculado</th><th>Situação</th><th>Data</th><th></th></tr></thead><tbody>
        {rows.map(job => <tr key={job._id}><td><strong>{shortId(job._id)}</strong></td><td>{getServiceLabel(job.servico)}</td><td>{money(job.valorCentavos)}</td><td><Status value={job.status} /></td><td>{dateLabel(job.createdAt)}</td><td><button className="mam-inline" onClick={() => { setSelected(job); setReason(''); }}>Detalhes</button></td></tr>)}
      </tbody></table></div>
      {!rows.length && !loading && <Empty>Nenhuma solicitação encontrada.</Empty>}
    </div>
    {selected && <div className="mam-card mam-detail"><div className="mam-card-title"><div><h3>Detalhes da viagem {shortId(selected._id)}</h3><p><Status value={selected.status} /> · {getServiceLabel(selected.servico)}</p></div>
      <button className="mam-btn mam-btn--quiet" onClick={() => setSelected(null)}>Fechar</button></div>
      <div className="mam-detailgrid"><div><span>Origem</span><strong>{shortLocation(selected.origem)}</strong></div><div><span>Destino</span><strong>{shortLocation(selected.destino)}</strong></div>
        <div><span>Distância / duração</span><strong>{Number(selected.distanciaKm || 0).toFixed(1)} km / {Math.round(Number(selected.duracaoMin || 0))} min</strong></div>
        <div><span>Valor calculado</span><strong>{money(selected.valorCentavos)}</strong></div>
        <div><span>Motorista vinculado</span><strong>{shortId(selected.motoristaId)}</strong></div>
        <div><span>Pagamento direto</span><strong>{(selected.pagamento?.metodo || '—').toUpperCase()} · {selected.pagamento?.status || 'pendente'}</strong></div>
      </div>
      <p className="mam-help">O Tanamão+ calcula o preço, mas não recebe nem comprova automaticamente os pagamentos feitos ao motorista.</p>
      {!terminal && <div className="mam-section"><Field label="Motivo para cancelamento administrativo"><textarea rows="2" value={reason} maxLength={400} onChange={e => setReason(e.target.value)} placeholder="Descreva o motivo…" /></Field>
        <div className="mam-actionrow"><button className="mam-btn mam-btn--danger" disabled={busy} onClick={cancel}>Cancelar viagem</button>
          {['aceita', 'no_local', 'em_andamento'].includes(selected.status) && <button className="mam-btn mam-btn--quiet" disabled={busy} onClick={resetPin}>Desbloquear tentativas de PIN</button>}
        </div></div>}
    </div>}
  </>;
}

function Demanda() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const data = await getMobilityJobs(); setRows(data.solicitacoes || []); setError(''); }
    catch (e) { setError(mobilityError(e)); setRows([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const groups = useMemo(() => {
    const min = Date.now() - 30 * 60 * 1000;
    const map = new Map();
    for (const job of rows) {
      if (new Date(job.createdAt).getTime() < min) continue;
      if (!['procurando', 'ofertada', 'aceita', 'no_local', 'em_andamento', 'concluida'].includes(job.status)) continue;
      const city = job.origem?.cidade || job.origem?.city;
      const uf = job.origem?.uf || job.origem?.estado || job.origem?.region;
      if (!city || !uf) continue;
      const key = `${String(city).trim().toLowerCase()}|${String(uf).trim().toLowerCase()}`;
      const current = map.get(key) || { label: `${city} / ${uf}`, count: 0, corridas: 0, entregas: 0, fretes: 0 };
      current.count += 1;
      if (String(job.servico).startsWith('corrida_')) current.corridas += 1;
      else if (String(job.servico).startsWith('entrega_')) current.entregas += 1;
      else current.fretes += 1;
      map.set(key, current);
    }
    // Nao exibe agrupamentos pequenos para evitar expor demanda individual.
    return [...map.values()].filter(item => item.count >= 3).sort((a, b) => b.count - a.count);
  }, [rows]);
  return <>
    <div className="mam-toolbar"><div><h2>Demanda recente</h2><p>Leitura administrativa por município</p></div><button className="mam-btn mam-btn--quiet" onClick={refresh} disabled={loading}>↻ Atualizar</button></div>
    <Notice message={error} />
    <div className="mam-card"><h3>Localidades com solicitações</h3><p>Resumo das últimas 100 solicitações, considerando somente os últimos 30 minutos. Exibimos locais com ao menos três pedidos. Não são projeções de ganhos e não representam o mapa de demanda do motorista.</p>
      {groups.length ? <div className="mam-demandgrid">{groups.map(g => <div className="mam-demandcard" key={g.label}><small>LOCALIDADE</small><strong>{g.label}</strong><div className="mam-demandcount">{g.count} <span>solicitações</span></div>
        <p>{g.corridas} corrida(s) · {g.entregas} entrega(s) · {g.fretes} frete(s)</p></div>)}</div> : <Empty>{loading ? 'Consultando dados…' : 'Sem solicitações suficientes nas localidades para mostrar demanda recente.'}</Empty>}
    </div>
    <p className="mam-help">O mapa de áreas de maior procura que aparece aos motoristas utiliza um cálculo próprio no backend, considerando pedidos reais e motoristas online. Esta tela é apenas um resumo operacional.</p>
  </>;
}

function CidadesMoto() {
  const [rows,setRows]=useState([]);
  const [page,setPage]=useState(1);
  const [total,setTotal]=useState(0);
  const [status,setStatus]=useState('');
  const [busca,setBusca]=useState('');
  const [buscaAplicada,setBuscaAplicada]=useState('');
  const [selected,setSelected]=useState(null);
  const [decision,setDecision]=useState('pendente');
  const [note,setNote]=useState('');
  const [source,setSource]=useState('');
  const [reviewDate,setReviewDate]=useState('');
  const [confirmed,setConfirmed]=useState(false);
  const [pontaConfirmed,setPontaConfirmed]=useState(false);
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const refresh=useCallback(async()=>{
    setLoading(true);
    try{const r=await getMotoPolicies({status,busca:buscaAplicada,page});setRows(r.localidades||[]);setTotal(r.total||0);setError('');}
    catch(e){setError(mobilityError(e));}
    finally{setLoading(false);}
  },[status,buscaAplicada,page]);
  useEffect(()=>{refresh();},[refresh]);
  const select=(r)=>{
    setSelected(r);setDecision(r.status);setNote(r.fundamento||'');setSource(r.fonteOficial||'');
    setReviewDate(r.analisarNovamenteEm?new Date(r.analisarNovamenteEm).toISOString().slice(0,10):'');
    setConfirmed(false);setPontaConfirmed(false);setError('');setSuccess('');
  };
  const ponta=selected?.pais==='BR'&&selected?.uf==='MS'&&selected?.cidadeNormalizada==='ponta pora';
  const save=async()=>{
    if(!selected||saving)return;
    if(note.trim().length<30){setError('Descreva o fundamento e a justificativa com pelo menos 30 caracteres.');return;}
    if(decision!=='pendente'&&!source.trim()){setError('Informe o link HTTPS da fonte legal oficial.');return;}
    if(decision==='autorizado'&&(!reviewDate||!confirmed)){setError('Defina a data para nova revisao e confirme a analise documental.');return;}
    if(decision==='autorizado'&&ponta&&!pontaConfirmed){setError('Ponta Pora: confirme a existencia de norma posterior oficial que afaste a restricao do artigo 16.');return;}
    if(!window.confirm('Registrar decisao? Ela afetara imediatamente as corridas de moto nesta localidade.'))return;
    setSaving(true);setError('');setSuccess('');
    try{
      await reviewMotoPolicy(selected.chave,{status:decision,fundamento:note.trim(),fonteOficial:source.trim(),
        analisarNovamenteEm:decision==='autorizado'?new Date(`${reviewDate}T23:59:59.000Z`).toISOString():null,
        confirmouAnalise:confirmed,confirmacaoAtualizacaoLei:pontaConfirmed?'CONFIRMO_REVOGACAO_ART16':''});
      setSelected(null);setSuccess('Revisao registrada. O app consultara essa nova regra automaticamente.');await refresh();
    }catch(e){setError(mobilityError(e));}
    finally{setSaving(false);}
  };
  const statusText={pendente:'Aguardando revisao',autorizado:'Habilitada',restrito:'Restricao legal',revisao_vencida:'Revisao vencida',desativado_globalmente:'Modulo desativado'};
  return <>
    <div className="mam-toolbar"><div><h2>Cidades e permissoes de moto</h2><p>Descoberta automatica, revisao humana e vencimento das autorizacoes</p></div>
      <button className="mam-btn mam-btn--quiet" disabled={loading} onClick={refresh}>Atualizar</button></div>
    <Notice message={error}/><Notice message={success} variant="success"/>
    <div className="mam-card">
      <div className="mam-notice mam-notice--warning">Novas cidades aparecem automaticamente quando o cliente escolhe a origem. Anuncios de mototaxi e resultados de busca nao comprovam permissao. Sem decisao fundamentada, a corrida de moto permanece bloqueada.</div>
      <div className="mam-filterrow mam-moto-filters">
        <Field label="Situacao"><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);setSelected(null);}}><option value="">Todas</option><option value="pendente">Em revisao</option><option value="autorizado">Autorizadas</option><option value="restrito">Restritas</option></select></Field>
        <Field label="Cidade"><input value={busca} onChange={e=>setBusca(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){setPage(1);setBuscaAplicada(busca.trim());}}} placeholder="Ex.: Ponta Pora" maxLength={60}/></Field>
        <button className="mam-btn mam-btn--quiet" onClick={()=>{setPage(1);setBuscaAplicada(busca.trim());}}>Buscar</button>
        <p>{loading?'Consultando...':`${total} cidades`}</p>
      </div>
      <div className="mam-tablewrap"><table className="mam-table"><thead><tr><th>Localidade</th><th>Situacao</th><th>Ultima consulta</th><th>Revisar ate</th><th>Analise</th></tr></thead>
        <tbody>{rows.map(r=><tr key={r.chave}><td><strong>{r.cidade}</strong><div className="mam-small">{r.uf} / {r.pais}</div></td>
          <td><span className={`mam-status mam-status--${r.politica?.permitida?'good':r.politica?.situacao==='restrito'?'bad':'neutral'}`}>{statusText[r.politica?.situacao]||'Pendente'}</span></td>
          <td>{dateLabel(r.consultadaEm)}</td><td>{dateOnly(r.analisarNovamenteEm)}</td><td><button className="mam-btn mam-btn--quiet" onClick={()=>select(r)}>Revisar</button></td></tr>)}</tbody></table></div>
      {!loading&&!rows.length&&<Empty>Nenhuma cidade encontrada. A lista sera preenchida automaticamente conforme consultas dos clientes.</Empty>}
      <div className="mam-pagination"><button className="mam-btn mam-btn--quiet" disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>Pagina {page} / {Math.max(1,Math.ceil(total/30))}</span><button className="mam-btn mam-btn--quiet" disabled={page*30>=total||loading} onClick={()=>setPage(p=>p+1)}>Proxima</button></div>
    </div>
    {selected&&<div className="mam-card mam-moto-review">
      <div className="mam-card-title"><div><h3>Revisar {selected.cidade} / {selected.uf} / {selected.pais}</h3><p>O sistema registra a decisao e o documento que a fundamenta.</p></div><button className="mam-btn mam-btn--quiet" onClick={()=>setSelected(null)}>Fechar</button></div>
      {ponta&&<Notice variant="warning" message="Ponta Pora: o art. 16 da Lei Municipal 4.441/2020 restringe o cadastro de motocicletas em plataformas abrangidas. Exija prova oficial de revogacao ou alteracao antes de liberar."/>}
      <div className="mam-gridform"><Field label="Nova situacao"><select value={decision} onChange={e=>setDecision(e.target.value)}><option value="pendente">Aguardando verificacao</option><option value="restrito">Restricao identificada</option><option value="autorizado">Autorizar apos verificar</option></select></Field>
      {decision==='autorizado'&&<Field label="Revisar autorizacao ate"><input type="date" value={reviewDate} onChange={e=>setReviewDate(e.target.value)}/></Field>}</div>
      <Field label="Fundamento legal e justificativa"><textarea rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Lei, artigo, data de vigencia e condicoes aplicaveis..." maxLength={1200}/></Field>
      <Field label="Documento oficial (link HTTPS)"><input type="url" value={source} onChange={e=>setSource(e.target.value)} placeholder="https://..." maxLength={800}/></Field>
      {!!selected.fonteOficial&&<p className="mam-help">Fonte anterior: <a href={selected.fonteOficial} target="_blank" rel="noopener noreferrer">Consultar documento</a></p>}
      {decision==='autorizado'&&<label className="mam-check mam-moto-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Confirmei a regra legal vigente e as autorizacoes exigidas para a operacao do Tanamao+.</label>}
      {decision==='autorizado'&&ponta&&<label className="mam-check mam-moto-confirm"><input type="checkbox" checked={pontaConfirmed} onChange={e=>setPontaConfirmed(e.target.checked)}/> Tenho documento oficial posterior que revoga ou afasta expressamente o artigo 16 e registrei essa norma acima.</label>}
      <div className="mam-actionrow"><button className="mam-btn" disabled={saving} onClick={save}>{saving?'Salvando...':'Salvar decisao'}</button></div>
      <p className="mam-help">Autorizacao territorial nao substitui habilitacao de motoristas, documentos, licenca da plataforma nem requisitos do municipio. Autorizacoes vencidas tornam-se indisponiveis automaticamente.</p>
    </div>}
  </>;
}
