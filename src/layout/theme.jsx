import {createContext,useContext,useEffect,useState} from 'react';
const Context=createContext(null);
const valid=['system','light','dark','forest'];
export function ThemeProvider({children}){
 const [theme,setTheme]=useState(()=>{const t=localStorage.getItem('tanamao-admin-theme');return valid.includes(t)?t:'system';});
 useEffect(()=>{const mq=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{document.documentElement.dataset.adminTheme=theme==='system'?(mq.matches?'dark':'light'):theme;};apply();localStorage.setItem('tanamao-admin-theme',theme);mq.addEventListener('change',apply);return()=>mq.removeEventListener('change',apply);},[theme]);
 return <Context.Provider value={{theme,setTheme}}>{children}</Context.Provider>;
}
export const useTheme=()=>useContext(Context);
