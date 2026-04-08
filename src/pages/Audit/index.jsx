import { useEffect, useState } from "react";
import API from "../../services/api";

function formatAction(log){

  switch(log.action){

    case "activate":
      return "Ativou assinatura"

    case "block":
      return "Bloqueou financeiramente"

    case "mark-overdue":
      return "Marcou atrasado"

    case "extend-trial":
      return "Estendeu trial"

    case "user-status-blocked":
      return "Bloqueou usuário"

    case "user-status-active":
      return "Desbloqueou usuário"

    default:
      return log.action
  }
}

export default function Audit(){

  const [logs,setLogs] = useState([])
  const [search,setSearch] = useState("")

  useEffect(()=>{
    load()
  },[])

  async function load(){
    const res = await API.get("/admin/audit")
    setLogs(res.data.data || [])
  }

  const filtered = logs.filter(log => {

    const text = (
  formatAction(log) +
  (log.user?.name || "") +
  (log.targetUser?.name || "") +
  (log.targetUser?.email || "") +
  (log.targetUser?._id || "")
).toLowerCase()

return text.includes(search.toLowerCase())
  })

  return (
    <div style={{padding:24}}>

      <h1 style={{
        fontSize:26,
        fontWeight:900,
        marginBottom:10
      }}>
        Atividades do sistema
      </h1>

      <input
        placeholder="Buscar ação, usuário..."
        value={search}
        onChange={e=>setSearch(e.target.value)}
        style={{
          width:"100%",
          padding:12,
          borderRadius:10,
          border:"1px solid #E5E7EB",
          marginBottom:20
        }}
      />

      <div style={{
        background:"#fff",
        borderRadius:18,
        padding:20,
        border:"1px solid #E5E7EB"
      }}>

        {filtered.map(log => (

          <div
            key={log._id}
            style={{
              padding:14,
              borderBottom:"1px solid #F1F5F9"
            }}
          >

            <div style={{
              fontWeight:700,
              fontSize:14
            }}>
              {formatAction(log)}
            </div>

            <div style={{
              fontSize:12,
              color:"#64748B",
              marginTop:4
            }}>
              Usuário: {log.targetId}
            </div>

            <div style={{
              fontSize:12,
              color:"#64748B"
            }}>
              Admin: {log.adminId?.name}
            </div>

            <div style={{
              fontSize:11,
              color:"#94A3B8",
              marginTop:2
            }}>
              {new Date(log.createdAt).toLocaleString()}
            </div>

          </div>

        ))}

      </div>

    </div>
  )
}