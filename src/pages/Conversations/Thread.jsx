import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Page from "../../layout/Page";

import {
  getConversationMessages,
  sendConversationMessage,
} from "../../services/conversations";

export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getConversationMessages(id);
      setMessages(data || []);
    } catch (err) {
      console.log("erro thread", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!text.trim()) return;

    await sendConversationMessage(id, text);
    setText("");
    load();
  }

  if (loading) {
    return <Page title="Thread">Carregando...</Page>;
  }

  return (
    <Page title="Conversa">
      <button onClick={() => navigate(-1)} style={back}>
        ← Voltar
      </button>

      <div style={chat}>
        {messages.map((m) => {
  const isAdmin =
    m.senderType === "admin" ||
    m.sender === "admin" ||
    m.from === "admin" ||
    m.role === "admin" ||
    m.isAdmin === true;

  return (
    <div
      key={m._id}
      style={{
        display: "flex",
        justifyContent: isAdmin
          ? "flex-end"
          : "flex-start",
      }}
    >
      <div
        style={{
          ...bubble,
          background: isAdmin
            ? "#14532D"
            : "#F3F4F6",
          color: isAdmin ? "#fff" : "#111",
        }}
      >
        {m.text}
      </div>
    </div>
  );
})}

        <div ref={bottomRef} />
      </div>

      <div style={inputBox}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma resposta..."
          style={input}
          onKeyDown={(e) =>
            e.key === "Enter" && handleSend()
          }
        />

        <button onClick={handleSend} style={send}>
          Enviar
        </button>
      </div>
    </Page>
  );
}

/* ================= STYLES ================= */

const chat = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginTop: 20,
  padding: 20,
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  height: "60vh",
  overflowY: "auto",
};

const bubble = {
  padding: "10px 14px",
  borderRadius: 16,
  maxWidth: 420,
  fontSize: 14,
};

const time = {
  fontSize: 10,
  opacity: 0.7,
  marginTop: 4,
  textAlign: "right",
};

const inputBox = {
  display: "flex",
  gap: 10,
  marginTop: 12,
};

const input = {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  fontSize: 14,
};

const send = {
  background: "#14532D",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const back = {
  background: "#111827",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
};