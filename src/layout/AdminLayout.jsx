import {useEffect,useMemo,useRef,useState} from 'react';
import {Link,Outlet,useLocation,useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import logo from '../assets/icon.png';
import {useTheme} from './theme';
import './adminShell.css';
import {OperationContext,useOperationState} from '../pages/Operacao/useOperation';
import {buildOverview} from '../pages/Operacao/logic';

const groups=[
 ['VISÃO GERAL',[
  ['Central de operações','/','dashboard'],['Indicadores','/indicadores','dashboard']]],
 ['OPERAÇÃO',[
  ['Pedidos','/orders','orders'],['Serviços e oportunidades','/servicos','orders'],['Mobilidade','/mobilidade','mobility'],['Usuários','/users','users'],['Conversas e suporte','/conversations','chat']]],
 ['NEGÓCIO',[
  ['Financeiro','/finance','finance']]],
 ['SISTEMA',[
  ['Monitoramento','/observability','dashboard'],['Bugs','/bugs','bug'],['Auditoria','/audit','audit']]]
];
const items=groups.flatMap(x=>x[1]);
const shortcuts=[...items,['Tarifa dinâmica','/mobilidade?aba=dinamica','mobility'],['Aprovar motoristas','/mobilidade?aba=motoristas&filtro=em_analise','mobility'],['Permissões municipais','/mobilidade?aba=cidades-moto&filtro=pendente','mobility'],['Tarifas','/mobilidade?aba=tarifas','mobility'],['Conciliação financeira','/finance/reconciliation','finance'],['Transações','/finance/transactions','finance'],['Acessos profissionais','/finance/users','finance'],['Pedidos sem propostas','/servicos?filtro=sem-proposta','orders']];
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const active=(path,to)=>to==='/'?path==='/':path===to||path.startsWith(to+'/');
export default function AdminLayout(){
 const operation=useOperationState();const attention=useMemo(()=>buildOverview(operation.sources).active.filter(x=>!x.stale).length,[operation.sources]);
 const navigate=useNavigate(),location=useLocation();const {admin,logout}=useAuth();const {theme,setTheme}=useTheme();
 const [mobile,setMobile]=useState(false),[compact,setCompact]=useState(()=>localStorage.getItem('tanamao-admin-sidebar')==='compact'),[searchOpen,setSearchOpen]=useState(false),[query,setQuery]=useState('');const input=useRef(null),searchBtn=useRef(null);
 const title=items.find(x=>active(location.pathname,x[1]))?.[0]||'Central de operações';
 const name=admin?.name||admin?.nome||'Administrador';const initial=name.trim().charAt(0).toUpperCase();
 const matches=useMemo(()=>shortcuts.filter(x=>normalize(x[0]).includes(normalize(query))).slice(0,12),[query]);
 useEffect(()=>{localStorage.setItem('tanamao-admin-sidebar',compact?'compact':'expanded');},[compact]);
 useEffect(()=>{setMobile(false);setSearchOpen(false);},[location.pathname,location.search]);
 useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setQuery('');setSearchOpen(true);}if(e.key==='Escape'){setSearchOpen(false);setMobile(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{if(searchOpen)input.current?.focus();},[searchOpen]);
 const closeSearch=()=>{setSearchOpen(false);searchBtn.current?.focus();};
 const go=to=>{navigate(to);setSearchOpen(false);setMobile(false);};
 return <OperationContext.Provider value={operation}><div className={'ad-shell '+(compact?'ad-compact':'')}> 
 {mobile&&<button className="ad-overlay" aria-label="Fechar menu" onClick={()=>setMobile(false)}/>}
 <aside className={'ad-sidebar '+(mobile?'ad-mobile-open':'')}><div className="ad-brand"><img src={logo} alt=""/><div><strong>Tanamão<span>+</span></strong><small>Central de gestão</small></div><button className="ad-icon-button ad-close-mobile" aria-label="Fechar menu" onClick={()=>setMobile(false)}>×</button></div>
 <div className="ad-workspace"><span className="ad-workspace-mark">T+</span><div><strong>Operações</strong><small>Área administrativa</small></div></div>
 <nav aria-label="Navegação principal" className="ad-nav">{groups.map(([label,links])=><section key={label}><h2>{label}</h2>{links.map(([label,to,icon])=><Link to={to} key={to} title={label} aria-label={label} aria-current={active(location.pathname,to)?'page':undefined} className={'ad-nav-link '+(active(location.pathname,to)?'active':'')}><NavIcon name={icon}/><span>{label}</span></Link>)}</section>)}</nav>
 <div className="ad-sidebar-footer"><div className="ad-person"><span className="ad-avatar">{initial}</span><div><strong>{name}</strong><small>Administrador</small></div></div><button className="ad-nav-link ad-logout" title="Sair da central" onClick={()=>{logout();navigate('/login',{replace:true});}}><NavIcon name="logout"/><span>Sair da central</span></button></div></aside>
 <main className="ad-main"><header className="ad-topbar"><div className="ad-top-left"><button className="ad-icon-button ad-menu-mobile" aria-label="Abrir menu" onClick={()=>setMobile(true)}><NavIcon name="menu"/></button><button className="ad-icon-button ad-menu-desktop" aria-label={compact?'Expandir menu':'Recolher menu'} onClick={()=>setCompact(c=>!c)}><NavIcon name="menu"/></button><div className="ad-crumb"><span>Central / </span><strong>{title}</strong></div></div><div className="ad-top-actions"><button ref={searchBtn} className="ad-search" onClick={()=>{setQuery('');setSearchOpen(true);}}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span>Buscar ferramenta</span><kbd>Ctrl K</kbd></button><Link to="/" className="ad-attention" title="Pendências confirmadas" aria-label={`${attention} tipos de pendências confirmadas. Abrir central.`}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 6-3 7-3 9h18c0-2-3-3-3-9M10 21h4"/></svg>{attention>0&&<span>{attention}</span>}</Link><label className="ad-theme"><span className="ad-theme-label">Tema</span><select aria-label="Tema do painel" value={theme} onChange={e=>setTheme(e.target.value)}><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Escuro</option><option value="forest">Verde</option></select></label><Link to="/" title="Central de operações" className="ad-avatar ad-header-avatar" aria-label="Central de operações">{initial}</Link></div></header><div className="ad-content"><Outlet/></div></main>
 {searchOpen&&<div className="ad-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeSearch();}}><div className="ad-dialog" role="dialog" aria-modal="true" aria-label="Buscar ferramenta" onKeyDown={e=>{if(e.key==='Tab'){const nodes=[...e.currentTarget.querySelectorAll('button,input')];if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus();}}}}><div className="ad-dialog-search"><input ref={input} placeholder="Buscar ferramenta ou tarefa..." aria-label="Pesquisar" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&matches.length)go(matches[0][1]);}}/><button className="ad-icon-button" aria-label="Fechar busca" onClick={closeSearch}>×</button></div><div className="ad-dialog-results">{matches.map(([label,to,icon])=><button key={to} onClick={()=>go(to)}><NavIcon name={icon}/><span>{label}</span><span>↗</span></button>)}{!matches.length&&<p>Nenhuma ferramenta encontrada.</p>}</div><div className="ad-dialog-hint">Enter para abrir o primeiro resultado · Esc para fechar</div></div></div>}
 </div></OperationContext.Provider>;
}

function NavIcon({
  name,
}) {
  const common = {
    width: 19,
    height: 19,
    viewBox:
      "0 0 24 24",
    fill: "none",
    stroke:
      "currentColor",
    strokeWidth:
      1.8,
    strokeLinecap:
      "round",
    strokeLinejoin:
      "round",
    "aria-hidden":
      true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="2"
          />

          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="2"
          />

          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="2"
          />

          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="2"
          />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <path d="M6 3H18V21H6Z" />

          <path d="M9 7H15" />

          <path d="M9 11H15" />

          <path d="M9 15H13" />
        </svg>
      );

    case "mobility":
      return (
        <svg {...common}>
          <path d="M5 16l1.6-6.2A2 2 0 0 1 8.5 8.3h7A2 2 0 0 1 17.4 9.8L19 16" />
          <path d="M3.5 16h17v3h-17z" />
          <path d="M6 12h12" />
          <circle cx="7" cy="18" r="1" />
          <circle cx="17" cy="18" r="1" />
          <path d="M4.5 5h4" />
        </svg>
      );

    case "finance":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="6"
            width="18"
            height="13"
            rx="3"
          />

          <path d="M3 10H21" />

          <path d="M16 15H18" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <path d="M16 21V19C16 16.8 14.2 15 12 15H6C3.8 15 2 16.8 2 19V21" />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path d="M22 21V19C22 17.1 20.7 15.5 19 15.1" />

          <path d="M16 3.1C17.7 3.5 19 5.1 19 7C19 8.9 17.7 10.5 16 10.9" />
        </svg>
      );

    case "chat":
      return (
        <svg {...common}>
          <path d="M21 12A8 8 0 0 1 13 20H7L3 22L4.3 17.5A8 8 0 1 1 21 12Z" />

          <path d="M8 12H8.01" />

          <path d="M12 12H12.01" />

          <path d="M16 12H16.01" />
        </svg>
      );

    case "bug":
      return (
        <svg {...common}>
          <rect
            x="7"
            y="8"
            width="10"
            height="11"
            rx="5"
          />

          <path d="M9 8V6A3 3 0 0 1 15 6V8" />

          <path d="M4 13H7" />

          <path d="M17 13H20" />

          <path d="M5 8L7 10" />

          <path d="M19 8L17 10" />

          <path d="M5 18L8 16" />

          <path d="M19 18L16 16" />
        </svg>
      );

    case "audit":
      return (
        <svg {...common}>
          <path d="M9 3H15L16 5H20V21H4V5H8L9 3Z" />

          <path d="M8 10H16" />

          <path d="M8 14H16" />

          <path d="M8 18H13" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17L15 12L10 7" />

          <path d="M15 12H3" />

          <path d="M14 3H20C20.6 3 21 3.4 21 4V20C21 20.6 20.6 21 20 21H14" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6H20" />

          <path d="M4 12H20" />

          <path d="M4 18H20" />
        </svg>
      );

    default:
      return null;
  }
}

