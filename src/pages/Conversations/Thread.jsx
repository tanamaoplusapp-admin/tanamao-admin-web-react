import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Page from "../../layout/Page";

import {
  getConversationMessages,
  sendConversationMessage,
} from "../../services/conversations";

let socketInstance = null;

function getSocketBaseUrl() {
  const apiBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "";

  return apiBase.replace(/\/api\/?$/, "");
}

export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function load() {
    try {
      const data = await getConversationMessages(id);
      setMessages(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    if (!id) return;

    const baseUrl = getSocketBaseUrl();
    if (!baseUrl) {
      console.log("socket: base URL não encontrada");
      return;
    }

    if (!socketInstance) {
      socketInstance = io(baseUrl, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        console.log("🟢 Socket web conectado");
      });

      socketInstance.on("disconnect", () => {
        console.log("🔴 Socket web desconectado");
      });
    }

    socketInstance.emit("join_chat", id);

    const onNewMessage = (message) => {
      const messageChatId =
        typeof message?.chat === "string"
          ? message.chat
          : message?.chat?._id || message?.chat;

      if (String(messageChatId) !== String(id)) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    socketInstance.on("support:new_message", onNewMessage);

    return () => {
      socketInstance?.off("support:new_message", onNewMessage);
    };
  }, [id]);

  async function handleSend() {
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      await sendConversationMessage(id, text.trim());
      setText("");
    } catch (err) {
      console.log("erro ao enviar mensagem", err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
                justifyContent: isAdmin ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...bubble,
                  background: isAdmin ? "#14532D" : "#F3F4F6",
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
          onKeyDown={handleKeyDown}
          disabled={sending}
        />

        <button onClick={handleSend} style={send} disabled={sending}>
          {sending ? "Enviando..." : "Enviar"}
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