import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../layout/Page";
import { getConversations } from "../../services/conversations";

export default function Conversations() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getConversations();
        setConversations(data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erro ao carregar conversas"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <Page title="Conversas">Carregando conversas…</Page>;
  }

  if (error) {
    return <Page title="Conversas">{error}</Page>;
  }

  return (
    <Page
      title="Conversas"
      subtitle="Central de suporte, reclamações e atendimentos"
    >
      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Usuário</th>
              <th style={th}>Status</th>
              <th style={th}>Última mensagem</th>
              <th style={th}>Atualizado em</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id || c._id}>
                <td style={td}>{c.user?.email || "—"}</td>
                <td
                  style={{
                    ...td,
                    fontWeight: 700,
                    color:
                      c.status === "open"
                        ? "#92400E"
                        : c.status === "closed"
                        ? "#15803D"
                        : "#374151",
                  }}
                >
                  {c.status || "—"}
                </td>
                <td style={td}>{c.lastMessage || "—"}</td>
                <td style={td}>
                  {c.updatedAt
                    ? new Date(c.updatedAt).toLocaleString()
                    : "—"}
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <button
                    onClick={() =>
                      navigate(`/conversations/${c.id || c._id}`)
                    }
                    style={btn}
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {conversations.length === 0 && (
          <div style={{ padding: 20 }}>
            Nenhuma conversa encontrada.
          </div>
        )}
      </div>
    </Page>
  );
}

/* ================= STYLES ================= */

const tableWrapper = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  overflow: "hidden",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: 12,
  textAlign: "left",
  fontSize: 13,
  fontWeight: 700,
  background: "#F3F4F6",
  color: "#374151",
};

const td = {
  padding: 12,
  borderTop: "1px solid #E5E7EB",
  fontSize: 14,
  color: "#111827",
};

const btn = {
  background: "#14532D",
  color: "#FFFFFF",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};
