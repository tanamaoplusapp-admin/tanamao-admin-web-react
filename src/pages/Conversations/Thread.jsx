import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  io,
} from "socket.io-client";

import Page from "../../layout/Page";

import {
  getConversationMessages,
  sendConversationMessage,
} from "../../services/conversations";

/* =========================================================
   SOCKET GLOBAL
========================================================= */

let socketInstance = null;

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  green: "#2E4F2F",
  greenDark: "#1D3A22",
  greenStrong: "#17391F",

  greenSoft: "#E7F0E7",
  greenSoft2: "#F3F8F3",

  orange: "#FF9900",
  orangeDark: "#A85A00",
  orangeSoft: "#FFF1DD",

  blue: "#2563EB",
  blueSoft: "#EFF6FF",

  red: "#DC2626",
  redSoft: "#FEF2F2",

  surface: "#FFFFFF",
  background: "#EEF3EE",

  text: "#182018",
  muted: "#6B7280",
  subtle: "#9CA3AF",

  border: "#DDE5DD",
  borderSoft: "#E7ECE7",
};

/* =========================================================
   SOCKET BASE URL

   Mantém a mesma ideia do seu código:
   usa a URL da API e remove /api do final.
========================================================= */

function getSocketBaseUrl() {
  const apiBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "";

  return String(apiBase)
    .trim()
    .replace(/\/api\/?$/, "");
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Thread() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const bottomRef =
    useRef(null);

  const chatRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  const firstScrollRef =
    useRef(true);

  /* =======================================================
     DADOS
  ======================================================= */

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    text,
    setText,
  ] = useState("");

  /* =======================================================
     ESTADOS
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    sendError,
    setSendError,
  ] = useState("");

  const [
    socketStatus,
    setSocketStatus,
  ] = useState(
    "connecting"
  );

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);

  /* =========================================================
     CARREGAR MENSAGENS

     SERVICE MANTIDO:
     getConversationMessages(id)
  ========================================================= */

  const load =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!id) {
          return;
        }

        try {
          if (silent) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError("");

          const data =
            await getConversationMessages(
              id
            );

          const list =
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.messages
                )
              ? data.messages
              : Array.isArray(
                  data?.items
                )
              ? data.items
              : Array.isArray(
                  data?.data
                )
              ? data.data
              : [];

          setMessages(
            list
          );

          setLastUpdated(
            new Date()
          );
        } catch (err) {
          console.error(
            "Erro ao carregar thread:",
            err
          );

          setError(
            err?.response?.data
              ?.message ||
              err?.response
                ?.data
                ?.error ||
              err?.message ||
              "Não foi possível carregar as mensagens."
          );
        } finally {
          setLoading(false);

          setRefreshing(
            false
          );
        }
      },
      [id]
    );

  useEffect(() => {
    void load();
  }, [load]);

  /* =========================================================
     SCROLL AUTOMÁTICO
  ========================================================= */

  useEffect(() => {
    if (
      messages.length ===
      0
    ) {
      return;
    }

    bottomRef.current?.scrollIntoView(
      {
        behavior:
          firstScrollRef.current
            ? "auto"
            : "smooth",

        block: "end",
      }
    );

    firstScrollRef.current =
      false;
  }, [
    messages.length,
  ]);

  /* =========================================================
     SOCKET

     EVENTOS MANTIDOS:
     entrar_chat
     support:new_message
  ========================================================= */

  useEffect(() => {
    if (!id) {
      return;
    }

    const baseUrl =
      getSocketBaseUrl();

    if (!baseUrl) {
      console.log(
        "socket: base URL não encontrada"
      );

      setSocketStatus(
        "unavailable"
      );

      return;
    }

    /* =========================================
       CRIAR SOCKET
    ========================================= */

    if (!socketInstance) {
      socketInstance =
        io(
          baseUrl,
          {
            transports: [
              "websocket",
            ],
          }
        );
    }

    const socket =
      socketInstance;

    /* =========================================
       EVENTOS DE CONEXÃO
    ========================================= */

    function onConnect() {
      console.log(
        "🟢 Socket web conectado"
      );

      setSocketStatus(
        "connected"
      );

      socket.emit(
        "entrar_chat",
        id
      );
    }

    function onDisconnect() {
      console.log(
        "🔴 Socket web desconectado"
      );

      setSocketStatus(
        "disconnected"
      );
    }

    function onConnectError(
      err
    ) {
      console.log(
        "Erro socket:",
        err
      );

      setSocketStatus(
        "disconnected"
      );
    }

    /* =========================================
       NOVA MENSAGEM
    ========================================= */

    function onNewMessage(
      message
    ) {
      const messageChatId =
        typeof message?.chat ===
        "string"
          ? message.chat
          : message?.chat?._id ||
            message?.chat?.id ||
            message?.chat;

      if (
        messageChatId &&
        String(
          messageChatId
        ) !== String(id)
      ) {
        return;
      }

      setMessages(
        (previous) => {
          const incomingId =
            getMessageId(
              message
            );

          if (
            incomingId
          ) {
            const exists =
              previous.some(
                (item) =>
                  String(
                    getMessageId(
                      item
                    )
                  ) ===
                  String(
                    incomingId
                  )
              );

            if (exists) {
              return previous;
            }
          }

          return [
            ...previous,
            message,
          ];
        }
      );

      setLastUpdated(
        new Date()
      );
    }

    socket.on(
      "connect",
      onConnect
    );

    socket.on(
      "disconnect",
      onDisconnect
    );

    socket.on(
      "connect_error",
      onConnectError
    );

    socket.on(
      "support:new_message",
      onNewMessage
    );

    /* =========================================
       SOCKET JÁ CONECTADO
    ========================================= */

    if (
      socket.connected
    ) {
      setSocketStatus(
        "connected"
      );

      socket.emit(
        "entrar_chat",
        id
      );
    } else {
      setSocketStatus(
        "connecting"
      );
    }

    /* =========================================
       CLEANUP

       Não desconectamos o socket global inteiro,
       pois ele pode ser reutilizado.
    ========================================= */

    return () => {
      socket.off(
        "connect",
        onConnect
      );

      socket.off(
        "disconnect",
        onDisconnect
      );

      socket.off(
        "connect_error",
        onConnectError
      );

      socket.off(
        "support:new_message",
        onNewMessage
      );
    };
  }, [id]);

  /* =========================================================
     ENVIAR

     SERVICE MANTIDO:
     sendConversationMessage(id, text)
  ========================================================= */

  const handleSend =
    useCallback(async () => {
      const value =
        text.trim();

      if (
        !value ||
        sending ||
        !id
      ) {
        return;
      }

      try {
        setSending(true);

        setSendError("");

        await sendConversationMessage(
          id,
          value
        );

        setText("");

        /*
         * Recarrega silenciosamente como fallback.
         *
         * Se o socket já entregar a mensagem,
         * o backend continuará sendo a fonte oficial.
         */
        await load({
          silent: true,
        });

        window.setTimeout(
          () => {
            textareaRef.current?.focus();
          },
          50
        );
      } catch (err) {
        console.error(
          "Erro ao enviar mensagem:",
          err
        );

        setSendError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Não foi possível enviar a mensagem."
        );
      } finally {
        setSending(false);
      }
    }, [
      id,
      load,
      sending,
      text,
    ]);

  /* =========================================================
     ENTER ENVIA / SHIFT + ENTER QUEBRA LINHA
  ========================================================= */

  function handleKeyDown(
    event
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void handleSend();
    }
  }

  /* =========================================================
     TEXTAREA AUTOMÁTICO
  ========================================================= */

  function handleTextChange(
    event
  ) {
    const value =
      event.target.value;

    setText(value);

    const element =
      event.target;

    element.style.height =
      "46px";

    element.style.height =
      `${Math.min(
        element.scrollHeight,
        130
      )}px`;
  }

  /* =========================================================
     INFORMAÇÕES DAS MENSAGENS
  ========================================================= */

  const stats =
    useMemo(() => {
      let admin = 0;
      let user = 0;

      messages.forEach(
        (message) => {
          if (
            isAdminMessage(
              message
            )
          ) {
            admin += 1;
          } else {
            user += 1;
          }
        }
      );

      return {
        total:
          messages.length,

        admin,
        user,
      };
    }, [messages]);

  const firstMessage =
    messages[0];

  const lastMessage =
    messages[
      messages.length - 1
    ];

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    messages.length ===
      0
  ) {
    return (
      <Page
        title="Conversa"
        subtitle="Central de atendimento"
      >
        <style>
          {GLOBAL_CSS}
        </style>

        <div
          className="thread-loading-root"
        >
          <div
            className="thread-spinner"
          />

          <strong>
            Carregando conversa
          </strong>

          <span>
            Buscando o histórico de
            mensagens...
          </span>
        </div>
      </Page>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Page
      title="Conversa"
      subtitle="Central de atendimento"
    >
      <style>
        {GLOBAL_CSS}
      </style>

      <div
        className="thread-shell"
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="thread-hero"
        >
          <div
            className="thread-hero-top"
          >
            <div
              className="thread-hero-identity"
            >
              <button
                type="button"
                className="thread-back-button"
                onClick={() =>
                  navigate(-1)
                }
                aria-label="Voltar"
              >
                ←
              </button>

              <div>
                <div
                  className="thread-hero-eyebrow"
                >
                  ATENDIMENTO TANAMÃO+
                </div>

                <h1>
                  Conversa #
                  {shortId(id)}
                </h1>

                <p>
                  Acompanhe o histórico
                  e responda ao usuário
                  em tempo real.
                </p>
              </div>
            </div>

            <div
              className="thread-hero-actions"
            >
              <SocketBadge
                status={
                  socketStatus
                }
              />

              <button
                type="button"
                className="thread-refresh-button"
                onClick={() =>
                  void load({
                    silent: true,
                  })
                }
                disabled={
                  refreshing
                }
              >
                <span
                  className={`thread-refresh-icon ${
                    refreshing
                      ? "loading"
                      : ""
                  }`}
                >
                  ↻
                </span>

                {refreshing
                  ? "Atualizando..."
                  : "Atualizar"}
              </button>
            </div>
          </div>

          {/* ===============================================
              INFO
          =============================================== */}

          <div
            className="thread-sync"
          >
            <span
              className={
                socketStatus ===
                "connected"
                  ? "thread-live-dot"
                  : "thread-offline-dot"
              }
            />

            {socketStatus ===
            "connected"
              ? "Atendimento conectado em tempo real"
              : socketStatus ===
                "connecting"
              ? "Conectando atendimento..."
              : "Atualização em tempo real indisponível"}

            {lastUpdated ? (
              <>
                <span
                  className="thread-sync-divider"
                >
                  •
                </span>

                Atualizado às{" "}
                {formatTime(
                  lastUpdated
                )}
              </>
            ) : null}
          </div>

          {/* ===============================================
              MÉTRICAS
          =============================================== */}

          <div
            className="thread-hero-stats"
          >
            <HeroMetric
              icon="💬"
              label="Mensagens"
              value={
                stats.total
              }
            />

            <HeroMetric
              icon="👤"
              label="Usuário"
              value={
                stats.user
              }
            />

            <HeroMetric
              icon="✓"
              label="Central"
              value={
                stats.admin
              }
            />

            <HeroMetric
              icon="◷"
              label="Última atividade"
              value={
                getRelativeTime(
                  getMessageDate(
                    lastMessage
                  )
                )
              }
              textValue
            />
          </div>
        </section>

        {/* =================================================
            ERRO DE CARREGAMENTO
        ================================================= */}

        {error ? (
          <div
            className="thread-error"
          >
            <div
              className="thread-error-left"
            >
              <div>
                !
              </div>

              <div>
                <strong>
                  Falha ao atualizar
                  a conversa
                </strong>

                <span>
                  {error}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void load({
                  silent: true,
                })
              }
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {/* =================================================
            CABEÇALHO DO CHAT
        ================================================= */}

        <div
          className="thread-section-header"
        >
          <div
            className="thread-section-icon"
          >
            💬
          </div>

          <div>
            <span>
              HISTÓRICO
            </span>

            <h2>
              Atendimento
            </h2>

            <p>
              {messages.length ===
              0
                ? "Nenhuma mensagem registrada."
                : `Conversa iniciada ${formatStartDate(
                    getMessageDate(
                      firstMessage
                    )
                  )}.`}
            </p>
          </div>
        </div>

        {/* =================================================
            CHAT
        ================================================= */}

        <section
          className="thread-chat-card"
        >
          {/* ===============================================
              CHAT TOPBAR
          =============================================== */}

          <div
            className="thread-chat-topbar"
          >
            <div
              className="thread-chat-user"
            >
              <div
                className="thread-chat-avatar"
              >
                <SupportIcon />
              </div>

              <div>
                <strong>
                  Atendimento
                  Tanamão+
                </strong>

                <span>
                  <i
                    className={
                      socketStatus ===
                        "connected"
                        ? "online"
                        : ""
                    }
                  />

                  {socketStatus ===
                  "connected"
                    ? "Online agora"
                    : "Histórico disponível"}
                </span>
              </div>
            </div>

            <div
              className="thread-message-count"
            >
              {stats.total.toLocaleString(
                "pt-BR"
              )}{" "}
              {stats.total ===
              1
                ? "mensagem"
                : "mensagens"}
            </div>
          </div>

          {/* ===============================================
              MENSAGENS
          =============================================== */}

          <div
            ref={
              chatRef
            }
            className="thread-messages"
          >
            {messages.length ===
            0 ? (
              <EmptyConversation />
            ) : (
              <MessageList
                messages={
                  messages
                }
              />
            )}

            <div
              ref={
                bottomRef
              }
            />
          </div>

          {/* ===============================================
              ERRO ENVIO
          =============================================== */}

          {sendError ? (
            <div
              className="thread-send-error"
            >
              <span>
                !
              </span>

              <div>
                <strong>
                  Mensagem não enviada
                </strong>

                <small>
                  {sendError}
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSendError(
                    ""
                  )
                }
              >
                ×
              </button>
            </div>
          ) : null}

          {/* ===============================================
              COMPOSER
          =============================================== */}

          <div
            className="thread-composer"
          >
            <div
              className="thread-composer-main"
            >
              <div
                className="thread-composer-avatar"
              >
                A
              </div>

              <div
                className="thread-textarea-wrapper"
              >
                <textarea
                  ref={
                    textareaRef
                  }
                  value={
                    text
                  }
                  onChange={
                    handleTextChange
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="Digite uma resposta..."
                  className="thread-textarea"
                  disabled={
                    sending
                  }
                  rows={1}
                />

                <div
                  className="thread-input-footer"
                >
                  <span>
                    Enter envia
                  </span>

                  <span>
                    Shift + Enter
                    quebra linha
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="thread-send-button"
                onClick={() =>
                  void handleSend()
                }
                disabled={
                  !text.trim() ||
                  sending
                }
              >
                {sending ? (
                  <>
                    <span
                      className="thread-send-spinner"
                    />

                    <span
                      className="thread-send-label"
                    >
                      Enviando
                    </span>
                  </>
                ) : (
                  <>
                    <SendIcon />

                    <span
                      className="thread-send-label"
                    >
                      Enviar
                    </span>
                  </>
                )}
              </button>
            </div>

            <div
              className="thread-composer-status"
            >
              <span
                className={
                  socketStatus ===
                    "connected"
                    ? "connected"
                    : ""
                }
              />

              {socketStatus ===
              "connected"
                ? "Resposta em tempo real ativa"
                : "A mensagem continuará sendo enviada pela API"}
            </div>
          </div>
        </section>

        {/* =================================================
            DADOS TÉCNICOS
        ================================================= */}

        <div
          className="thread-info-row"
        >
          <div
            className="thread-info-card"
          >
            <div
              className="thread-info-icon"
            >
              #
            </div>

            <div>
              <span>
                ID DA CONVERSA
              </span>

              <strong>
                {id ||
                  "—"}
              </strong>
            </div>
          </div>

          <div
            className="thread-info-card"
          >
            <div
              className="thread-info-icon orange"
            >
              ◉
            </div>

            <div>
              <span>
                CONEXÃO
              </span>

              <strong>
                {formatSocketStatus(
                  socketStatus
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="thread-footer"
        >
          <div>
            <strong>
              Central Tanamão+
            </strong>

            <span>
              •
            </span>

            Atendimento e suporte
          </div>

          {lastUpdated ? (
            <div>
              Última sincronização:{" "}
              <strong>
                {formatTime(
                  lastUpdated
                )}
              </strong>
            </div>
          ) : null}
        </footer>
      </div>
    </Page>
  );
}

/* =========================================================
   LISTA DE MENSAGENS
========================================================= */

function MessageList({
  messages,
}) {
  let lastDateKey =
    "";

  return messages.map(
    (
      message,
      index
    ) => {
      const messageId =
        getMessageId(
          message
        ) ||
        `${getMessageDate(
          message
        )}-${index}`;

      const date =
        getMessageDate(
          message
        );

      const dateKey =
        getDateKey(
          date
        );

      const showDivider =
        dateKey &&
        dateKey !==
          lastDateKey;

      if (dateKey) {
        lastDateKey =
          dateKey;
      }

      return (
        <div
          key={
            messageId
          }
        >
          {showDivider ? (
            <DateDivider
              date={
                date
              }
            />
          ) : null}

          <MessageBubble
            message={
              message
            }
          />
        </div>
      );
    }
  );
}

/* =========================================================
   MENSAGEM
========================================================= */

function MessageBubble({
  message,
}) {
  const isAdmin =
    isAdminMessage(
      message
    );

  const text =
    getMessageText(
      message
    );

  const date =
    getMessageDate(
      message
    );

  const senderName =
    getSenderName(
      message,
      isAdmin
    );

  return (
    <div
      className={`thread-message-row ${
        isAdmin
          ? "admin"
          : "user"
      }`}
    >
      {!isAdmin ? (
        <div
          className="thread-message-avatar user"
        >
          {getInitial(
            senderName
          )}
        </div>
      ) : null}

      <div
        className={`thread-message-group ${
          isAdmin
            ? "admin"
            : ""
        }`}
      >
        <div
          className="thread-message-meta"
        >
          <strong>
            {isAdmin
              ? "Central Tanamão+"
              : senderName}
          </strong>

          {date ? (
            <span>
              {formatMessageTime(
                date
              )}
            </span>
          ) : null}
        </div>

        <div
          className={`thread-bubble ${
            isAdmin
              ? "admin"
              : "user"
          }`}
        >
          <div
            className="thread-bubble-text"
          >
            {text ||
              "Mensagem sem conteúdo"}
          </div>

          {isAdmin ? (
            <div
              className="thread-message-check"
            >
              ✓
            </div>
          ) : null}
        </div>
      </div>

      {isAdmin ? (
        <div
          className="thread-message-avatar admin"
        >
          A
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
   DATE DIVIDER
========================================================= */

function DateDivider({
  date,
}) {
  return (
    <div
      className="thread-date-divider"
    >
      <span />

      <strong>
        {formatDateDivider(
          date
        )}
      </strong>

      <span />
    </div>
  );
}

/* =========================================================
   SOCKET BADGE
========================================================= */

function SocketBadge({
  status,
}) {
  const config = {
    connected: {
      label:
        "Tempo real ativo",

      className:
        "connected",
    },

    connecting: {
      label:
        "Conectando...",

      className:
        "connecting",
    },

    disconnected: {
      label:
        "Desconectado",

      className:
        "disconnected",
    },

    unavailable: {
      label:
        "Socket indisponível",

      className:
        "disconnected",
    },
  };

  const current =
    config[status] ||
    config.disconnected;

  return (
    <div
      className={`thread-socket-badge ${current.className}`}
    >
      <span />

      {
        current.label
      }
    </div>
  );
}

/* =========================================================
   HERO METRIC
========================================================= */

function HeroMetric({
  icon,
  label,
  value,
  textValue = false,
}) {
  return (
    <div
      className="thread-hero-metric"
    >
      <div
        className="thread-hero-metric-icon"
      >
        {icon}
      </div>

      <div
        className="thread-hero-metric-content"
      >
        <span>
          {label}
        </span>

        <strong
          className={
            textValue
              ? "text-value"
              : ""
          }
        >
          {typeof value ===
            "number"
            ? value.toLocaleString(
                "pt-BR"
              )
            : value ||
              "—"}
        </strong>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyConversation() {
  return (
    <div
      className="thread-empty"
    >
      <div
        className="thread-empty-icon"
      >
        💬
      </div>

      <strong>
        Nenhuma mensagem ainda
      </strong>

      <span>
        Quando o atendimento
        começar, as mensagens
        aparecerão aqui em tempo
        real.
      </span>
    </div>
  );
}

/* =========================================================
   ÍCONES
========================================================= */

function SendIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2L11 13" />

      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12A8 8 0 0 1 13 20H7L3 22L4.3 17.5A8 8 0 1 1 21 12Z" />

      <path d="M8 12H8.01" />

      <path d="M12 12H12.01" />

      <path d="M16 12H16.01" />
    </svg>
  );
}

/* =========================================================
   HELPERS - MENSAGEM
========================================================= */

function getMessageId(
  message
) {
  return (
    message?._id ||
    message?.id ||
    null
  );
}

function getMessageText(
  message
) {
  if (!message) {
    return "";
  }

  return (
    message?.text ||
    message?.message ||
    message?.content ||
    message?.body ||
    ""
  );
}

function getMessageDate(
  message
) {
  if (!message) {
    return null;
  }

  const value =
    message?.createdAt ||
    message?.sentAt ||
    message?.timestamp ||
    message?.date;

  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

/* =========================================================
   IDENTIFICA ADMIN

   Mantida a lógica do seu código,
   apenas centralizada.
========================================================= */

function isAdminMessage(
  message
) {
  return (
    message?.senderType ===
      "admin" ||
    message?.sender ===
      "admin" ||
    message?.from ===
      "admin" ||
    message?.role ===
      "admin" ||
    message?.isAdmin ===
      true
  );
}

function getSenderName(
  message,
  isAdmin
) {
  if (isAdmin) {
    return "Central Tanamão+";
  }

  const sender =
    message?.sender;

  if (
    sender &&
    typeof sender ===
      "object"
  ) {
    return (
      sender?.name ||
      sender?.nome ||
      sender?.email ||
      "Usuário"
    );
  }

  const user =
    message?.user;

  if (
    user &&
    typeof user ===
      "object"
  ) {
    return (
      user?.name ||
      user?.nome ||
      user?.email ||
      "Usuário"
    );
  }

  return (
    message?.senderName ||
    message?.userName ||
    "Usuário"
  );
}

/* =========================================================
   HELPERS - DATA
========================================================= */

function getDateKey(
  date
) {
  if (!date) {
    return "";
  }

  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join("-");
}

function formatMessageTime(
  date
) {
  if (!date) {
    return "";
  }

  return date.toLocaleTimeString(
    "pt-BR",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}

function formatTime(
  date
) {
  if (!date) {
    return "";
  }

  return date.toLocaleTimeString(
    "pt-BR",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}

function formatDateDivider(
  date
) {
  if (!date) {
    return "Mensagens";
  }

  const today =
    new Date();

  const yesterday =
    new Date();

  yesterday.setDate(
    yesterday.getDate() -
      1
  );

  if (
    isSameDay(
      date,
      today
    )
  ) {
    return "Hoje";
  }

  if (
    isSameDay(
      date,
      yesterday
    )
  ) {
    return "Ontem";
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        date.getFullYear() !==
        today.getFullYear()
          ? "numeric"
          : undefined,
    }
  );
}

function isSameDay(
  first,
  second
) {
  return (
    first.getDate() ===
      second.getDate() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getFullYear() ===
      second.getFullYear()
  );
}

function formatStartDate(
  date
) {
  if (!date) {
    return "em data não informada";
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",
    }
  );
}

function getRelativeTime(
  date
) {
  if (!date) {
    return "—";
  }

  const difference =
    Date.now() -
    date.getTime();

  if (
    difference <
    60 * 1000
  ) {
    return "Agora";
  }

  const minutes =
    Math.floor(
      difference /
        (60 * 1000)
    );

  if (
    minutes < 60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (
    hours < 24
  ) {
    return `${hours}h`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (
    days < 7
  ) {
    return `${days}d`;
  }

  return date.toLocaleDateString(
    "pt-BR"
  );
}

/* =========================================================
   HELPERS GERAIS
========================================================= */

function getInitial(
  value
) {
  return String(
    value || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();
}

function shortId(
  value
) {
  if (!value) {
    return "—";
  }

  return String(
    value
  ).slice(-8);
}

function formatSocketStatus(
  status
) {
  switch (status) {
    case "connected":
      return "Tempo real ativo";

    case "connecting":
      return "Conectando";

    case "unavailable":
      return "Indisponível";

    default:
      return "Desconectado";
  }
}

/* =========================================================
   CSS
========================================================= */

const GLOBAL_CSS = `
  /* =======================================================
     SHELL
  ======================================================= */

  .thread-shell {
    width: 100%;
    max-width: 1500px;

    margin: 0 auto;

    padding: 20px;

    box-sizing: border-box;

    border-radius: 28px;

    background:
      ${COLORS.background};

    color:
      ${COLORS.text};
  }

  /* =======================================================
     HERO
  ======================================================= */

  .thread-hero {
    overflow: hidden;

    padding: 26px;

    border-radius: 24px;

    background:
      linear-gradient(
        135deg,
        #203D24 0%,
        #2E4F2F 58%,
        #3C633D 100%
      );

    color: #FFFFFF;

    box-shadow:
      0 14px 36px
      rgba(31,55,34,.14);
  }

  .thread-hero-top {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 20px;
  }

  .thread-hero-identity {
    min-width: 0;

    display: flex;

    align-items:
      flex-start;

    gap: 12px;
  }

  .thread-back-button {
    width: 42px;
    height: 42px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    margin-top: 2px;

    border:
      1px solid
      rgba(255,255,255,.16);

    border-radius: 12px;

    background:
      rgba(255,255,255,.08);

    color: #FFFFFF;

    cursor: pointer;

    font-size: 18px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      background 150ms ease;
  }

  .thread-back-button:hover {
    transform:
      translateX(-2px);

    background:
      rgba(255,255,255,.13);
  }

  .thread-hero-eyebrow {
    margin-bottom: 4px;

    color:
      #BFD3C0;

    font-size: 9px;

    font-weight: 900;

    letter-spacing:
      1.1px;
  }

  .thread-hero h1 {
    margin: 0;

    color: #FFFFFF;

    font-size: 27px;

    line-height: 1.15;

    font-weight: 900;
  }

  .thread-hero p {
    max-width: 620px;

    margin:
      7px 0 0;

    color:
      #D7E4D8;

    font-size: 11px;

    line-height: 1.5;
  }

  /* =======================================================
     HERO ACTIONS
  ======================================================= */

  .thread-hero-actions {
    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 8px;
  }

  .thread-socket-badge {
    min-height: 38px;

    display: inline-flex;

    align-items: center;

    gap: 7px;

    padding:
      0 11px;

    border:
      1px solid
      rgba(255,255,255,.14);

    border-radius: 999px;

    background:
      rgba(255,255,255,.08);

    color:
      #DCE9DD;

    font-size: 8px;

    font-weight: 800;
  }

  .thread-socket-badge > span {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background:
      #9CA3AF;
  }

  .thread-socket-badge.connected
  > span {
    background:
      #66DB84;

    box-shadow:
      0 0 0 4px
      rgba(102,219,132,.13);
  }

  .thread-socket-badge.connecting
  > span {
    background:
      ${COLORS.orange};
  }

  .thread-socket-badge.disconnected
  > span {
    background:
      #F87171;
  }

  .thread-refresh-button {
    min-height: 40px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

    padding:
      0 13px;

    border: none;

    border-radius: 11px;

    background:
      ${COLORS.orange};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 9px;

    font-weight: 900;

    transition:
      transform 150ms ease,
      box-shadow 150ms ease;
  }

  .thread-refresh-button:not(:disabled):hover {
    transform:
      translateY(-1px);

    box-shadow:
      0 7px 18px
      rgba(255,153,0,.19);
  }

  .thread-refresh-button:disabled {
    opacity: .7;

    cursor: wait;
  }

  .thread-refresh-icon {
    display: inline-block;
  }

  .thread-refresh-icon.loading {
    animation:
      threadSpin
      .8s linear
      infinite;
  }

  /* =======================================================
     SYNC
  ======================================================= */

  .thread-sync {
    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 7px;

    margin-top: 15px;

    color:
      #D3E0D4;

    font-size: 8px;
  }

  .thread-live-dot,
  .thread-offline-dot {
    width: 7px;
    height: 7px;

    border-radius: 50%;
  }

  .thread-live-dot {
    background:
      #66DB84;

    box-shadow:
      0 0 0 4px
      rgba(102,219,132,.13);
  }

  .thread-offline-dot {
    background:
      #F87171;
  }

  .thread-sync-divider {
    opacity: .5;
  }

  /* =======================================================
     HERO STATS
  ======================================================= */

  .thread-hero-stats {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0,1fr)
      );

    gap: 9px;

    margin-top: 19px;
  }

  .thread-hero-metric {
    min-width: 0;

    min-height: 73px;

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 11px;

    border:
      1px solid
      rgba(255,255,255,.10);

    border-radius: 14px;

    background:
      rgba(255,255,255,.08);

    backdrop-filter:
      blur(10px);
  }

  .thread-hero-metric-icon {
    width: 37px;
    height: 37px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 11px;

    background:
      rgba(255,255,255,.10);

    color: #FFFFFF;

    font-size: 12px;

    font-weight: 900;
  }

  .thread-hero-metric-content {
    min-width: 0;
  }

  .thread-hero-metric-content
  > span {
    display: block;

    color:
      #C4D5C6;

    font-size: 8px;
  }

  .thread-hero-metric-content
  > strong {
    display: block;

    margin-top: 3px;

    color: #FFFFFF;

    font-size: 19px;

    font-weight: 900;

    white-space: nowrap;
  }

  .thread-hero-metric-content
  > strong.text-value {
    font-size: 12px;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  .thread-error {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    margin-top: 16px;

    padding: 13px;

    border:
      1px solid #FECACA;

    border-radius: 14px;

    background:
      ${COLORS.redSoft};
  }

  .thread-error-left {
    display: flex;

    align-items: center;

    gap: 9px;
  }

  .thread-error-left
  > div:first-child {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    background:
      #FEE2E2;

    color:
      ${COLORS.red};

    font-weight: 900;
  }

  .thread-error-left strong {
    display: block;

    color:
      #991B1B;

    font-size: 9px;
  }

  .thread-error-left span {
    display: block;

    margin-top: 2px;

    color:
      #B45353;

    font-size: 8px;
  }

  .thread-error > button {
    min-height: 33px;

    padding:
      0 10px;

    border: none;

    border-radius: 9px;

    background:
      ${COLORS.red};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     SECTION HEADER
  ======================================================= */

  .thread-section-header {
    display: flex;

    align-items: center;

    gap: 10px;

    margin-top: 27px;

    margin-bottom: 12px;
  }

  .thread-section-icon {
    width: 42px;
    height: 42px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 13px;

    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};

    font-size: 14px;
  }

  .thread-section-header
  > div:last-child
  > span {
    display: block;

    color:
      ${COLORS.orangeDark};

    font-size: 7px;

    font-weight: 900;

    letter-spacing:
      .7px;
  }

  .thread-section-header h2 {
    margin:
      2px 0 0;

    color:
      ${COLORS.greenDark};

    font-size: 19px;

    font-weight: 900;
  }

  .thread-section-header p {
    margin:
      2px 0 0;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  /* =======================================================
     CHAT CARD
  ======================================================= */

  .thread-chat-card {
    overflow: hidden;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 20px;

    background:
      ${COLORS.surface};

    box-shadow:
      0 8px 24px
      rgba(31,55,34,.04);
  }

  /* =======================================================
     CHAT TOPBAR
  ======================================================= */

  .thread-chat-topbar {
    min-height: 66px;

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    padding:
      10px 15px;

    border-bottom:
      1px solid
      ${COLORS.borderSoft};

    background:
      #FAFCFA;
  }

  .thread-chat-user {
    display: flex;

    align-items: center;

    gap: 9px;
  }

  .thread-chat-avatar {
    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 12px;

    background:
      ${COLORS.green};

    color: #FFFFFF;

    box-shadow:
      0 5px 12px
      rgba(46,79,47,.13);
  }

  .thread-chat-user strong {
    display: block;

    color:
      ${COLORS.greenDark};

    font-size: 10px;

    font-weight: 900;
  }

  .thread-chat-user span {
    display: flex;

    align-items: center;

    gap: 5px;

    margin-top: 2px;

    color:
      ${COLORS.muted};

    font-size: 7px;
  }

  .thread-chat-user i {
    width: 6px;
    height: 6px;

    display: inline-block;

    border-radius: 50%;

    background:
      ${COLORS.subtle};
  }

  .thread-chat-user i.online {
    background:
      #22C55E;
  }

  .thread-message-count {
    padding:
      6px 9px;

    border-radius: 999px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 7px;

    font-weight: 900;
  }

  /* =======================================================
     MESSAGES
  ======================================================= */

  .thread-messages {
    height:
      min(58vh, 650px);

    min-height: 420px;

    overflow-y: auto;

    padding:
      20px 18px;

    scroll-behavior:
      smooth;

    background:
      linear-gradient(
        180deg,
        #F9FBF9 0%,
        #F5F8F5 100%
      );

    scrollbar-width: thin;

    scrollbar-color:
      #CAD7CB
      transparent;
  }

  .thread-messages::-webkit-scrollbar {
    width: 7px;
  }

  .thread-messages::-webkit-scrollbar-track {
    background:
      transparent;
  }

  .thread-messages::-webkit-scrollbar-thumb {
    border-radius: 999px;

    background:
      #CAD7CB;
  }

  /* =======================================================
     DATE DIVIDER
  ======================================================= */

  .thread-date-divider {
    display: flex;

    align-items: center;

    gap: 9px;

    margin:
      12px 0 18px;
  }

  .thread-date-divider > span {
    flex: 1;

    height: 1px;

    background:
      ${COLORS.border};
  }

  .thread-date-divider strong {
    padding:
      5px 9px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 999px;

    background:
      rgba(255,255,255,.8);

    color:
      ${COLORS.muted};

    font-size: 7px;

    font-weight: 800;
  }

  /* =======================================================
     MESSAGE ROW
  ======================================================= */

  .thread-message-row {
    width: 100%;

    display: flex;

    align-items:
      flex-end;

    gap: 7px;

    margin-bottom: 11px;
  }

  .thread-message-row.admin {
    justify-content:
      flex-end;
  }

  .thread-message-row.user {
    justify-content:
      flex-start;
  }

  .thread-message-avatar {
    width: 29px;
    height: 29px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 9px;

    font-size: 9px;

    font-weight: 900;
  }

  .thread-message-avatar.user {
    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};
  }

  .thread-message-avatar.admin {
    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};
  }

  .thread-message-group {
    max-width:
      min(610px, 72%);

    min-width: 0;
  }

  .thread-message-group.admin {
    display: flex;

    flex-direction: column;

    align-items:
      flex-end;
  }

  .thread-message-meta {
    display: flex;

    align-items: center;

    gap: 7px;

    margin:
      0 4px 4px;
  }

  .thread-message-group.admin
  .thread-message-meta {
    flex-direction:
      row-reverse;
  }

  .thread-message-meta strong {
    color:
      ${COLORS.muted};

    font-size: 7px;

    font-weight: 800;
  }

  .thread-message-meta span {
    color:
      ${COLORS.subtle};

    font-size: 6px;
  }

  /* =======================================================
     BUBBLE
  ======================================================= */

  .thread-bubble {
    position: relative;

    max-width: 100%;

    padding:
      10px 13px;

    border-radius: 15px;

    box-shadow:
      0 3px 9px
      rgba(31,55,34,.04);
  }

  .thread-bubble.user {
    border:
      1px solid
      ${COLORS.border};

    border-bottom-left-radius:
      5px;

    background:
      ${COLORS.surface};

    color:
      ${COLORS.text};
  }

  .thread-bubble.admin {
    padding-right: 28px;

    border:
      1px solid
      rgba(29,58,34,.08);

    border-bottom-right-radius:
      5px;

    background:
      ${COLORS.green};

    color: #FFFFFF;

    box-shadow:
      0 5px 14px
      rgba(46,79,47,.12);
  }

  .thread-bubble-text {
    overflow-wrap:
      anywhere;

    white-space:
      pre-wrap;

    font-size: 10px;

    line-height: 1.55;
  }

  .thread-message-check {
    position: absolute;

    right: 9px;
    bottom: 6px;

    color:
      #A9D5AE;

    font-size: 7px;

    font-weight: 900;
  }

  /* =======================================================
     SEND ERROR
  ======================================================= */

  .thread-send-error {
    min-height: 48px;

    display: flex;

    align-items: center;

    gap: 8px;

    padding:
      8px 14px;

    border-top:
      1px solid #FECACA;

    background:
      ${COLORS.redSoft};
  }

  .thread-send-error
  > span {
    width: 27px;
    height: 27px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 8px;

    background:
      #FEE2E2;

    color:
      ${COLORS.red};

    font-size: 9px;

    font-weight: 900;
  }

  .thread-send-error
  > div {
    flex: 1;
  }

  .thread-send-error strong {
    display: block;

    color:
      #991B1B;

    font-size: 8px;
  }

  .thread-send-error small {
    display: block;

    margin-top: 1px;

    color:
      #B45353;

    font-size: 7px;
  }

  .thread-send-error
  > button {
    width: 27px;
    height: 27px;

    border: none;

    border-radius: 8px;

    background:
      transparent;

    color:
      ${COLORS.red};

    cursor: pointer;

    font-size: 15px;
  }

  /* =======================================================
     COMPOSER
  ======================================================= */

  .thread-composer {
    padding:
      12px 14px 10px;

    border-top:
      1px solid
      ${COLORS.borderSoft};

    background:
      ${COLORS.surface};
  }

  .thread-composer-main {
    display: flex;

    align-items:
      flex-end;

    gap: 9px;
  }

  .thread-composer-avatar {
    width: 38px;
    height: 38px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    margin-bottom: 3px;

    border-radius: 11px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 11px;

    font-weight: 900;
  }

  .thread-textarea-wrapper {
    flex: 1;

    overflow: hidden;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 14px;

    background:
      #FAFCFA;

    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .thread-textarea-wrapper:focus-within {
    border-color:
      #AFC5B0;

    box-shadow:
      0 0 0 3px
      rgba(46,79,47,.08);
  }

  .thread-textarea {
    width: 100%;

    height: 46px;

    min-height: 46px;

    max-height: 130px;

    display: block;

    resize: none;

    padding:
      12px 13px 5px;

    box-sizing: border-box;

    border: none;

    outline: none;

    background:
      transparent;

    color:
      ${COLORS.text};

    font-family: inherit;

    font-size: 10px;

    line-height: 1.45;
  }

  .thread-textarea::placeholder {
    color:
      ${COLORS.subtle};
  }

  .thread-input-footer {
    display: flex;

    align-items: center;

    gap: 8px;

    padding:
      0 12px 7px;

    color:
      ${COLORS.subtle};

    font-size: 6px;
  }

  .thread-input-footer
  span + span::before {
    content: "•";

    margin-right: 8px;
  }

  /* =======================================================
     SEND
  ======================================================= */

  .thread-send-button {
    min-width: 92px;

    height: 46px;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 6px;

    margin-bottom: 3px;

    padding:
      0 14px;

    border: none;

    border-radius: 13px;

    background:
      ${COLORS.orange};

    color: #FFFFFF;

    cursor: pointer;

    font-size: 9px;

    font-weight: 900;

    box-shadow:
      0 5px 12px
      rgba(255,153,0,.15);

    transition:
      transform 150ms ease,
      box-shadow 150ms ease,
      opacity 150ms ease;
  }

  .thread-send-button:not(:disabled):hover {
    transform:
      translateY(-1px);

    box-shadow:
      0 7px 17px
      rgba(255,153,0,.20);
  }

  .thread-send-button:disabled {
    opacity: .48;

    cursor:
      not-allowed;

    box-shadow: none;
  }

  .thread-send-spinner {
    width: 14px;
    height: 14px;

    border:
      2px solid
      rgba(255,255,255,.35);

    border-top-color:
      #FFFFFF;

    border-radius: 50%;

    animation:
      threadSpin
      .8s linear
      infinite;
  }

  .thread-composer-status {
    display: flex;

    align-items: center;

    justify-content:
      flex-end;

    gap: 5px;

    margin-top: 6px;

    color:
      ${COLORS.subtle};

    font-size: 6px;
  }

  .thread-composer-status
  > span {
    width: 5px;
    height: 5px;

    border-radius: 50%;

    background:
      ${COLORS.subtle};
  }

  .thread-composer-status
  > span.connected {
    background:
      #22C55E;
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  .thread-empty {
    min-height: 340px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;
  }

  .thread-empty-icon {
    width: 54px;
    height: 54px;

    display: flex;

    align-items: center;

    justify-content: center;

    margin-bottom: 10px;

    border-radius: 16px;

    background:
      ${COLORS.orangeSoft};

    font-size: 21px;
  }

  .thread-empty strong {
    color:
      ${COLORS.greenDark};

    font-size: 12px;
  }

  .thread-empty > span {
    max-width: 330px;

    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 8px;

    line-height: 1.5;
  }

  /* =======================================================
     INFO
  ======================================================= */

  .thread-info-row {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 9px;

    margin-top: 11px;
  }

  .thread-info-card {
    min-width: 0;

    display: flex;

    align-items: center;

    gap: 9px;

    padding: 11px;

    border:
      1px solid
      ${COLORS.border};

    border-radius: 14px;

    background:
      ${COLORS.surface};
  }

  .thread-info-icon {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    border-radius: 10px;

    background:
      ${COLORS.greenSoft};

    color:
      ${COLORS.green};

    font-size: 10px;

    font-weight: 900;
  }

  .thread-info-icon.orange {
    background:
      ${COLORS.orangeSoft};

    color:
      ${COLORS.orangeDark};
  }

  .thread-info-card
  > div:last-child {
    min-width: 0;
  }

  .thread-info-card span {
    display: block;

    color:
      ${COLORS.muted};

    font-size: 6px;

    font-weight: 900;

    letter-spacing:
      .5px;
  }

  .thread-info-card strong {
    display: block;

    margin-top: 3px;

    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    color:
      ${COLORS.text};

    font-size: 8px;

    font-weight: 900;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  .thread-loading-root {
    min-height: 430px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    border-radius: 24px;

    background:
      ${COLORS.background};

    text-align: center;
  }

  .thread-spinner {
    width: 38px;
    height: 38px;

    margin-bottom: 12px;

    border:
      4px solid
      ${COLORS.border};

    border-top-color:
      ${COLORS.orange};

    border-radius: 50%;

    animation:
      threadSpin
      .8s linear
      infinite;
  }

  .thread-loading-root strong {
    color:
      ${COLORS.greenDark};

    font-size: 13px;
  }

  .thread-loading-root span {
    margin-top: 4px;

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  @keyframes threadSpin {
    to {
      transform:
        rotate(360deg);
    }
  }

  /* =======================================================
     FOOTER
  ======================================================= */

  .thread-footer {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    flex-wrap: wrap;

    gap: 8px;

    margin-top: 27px;

    padding-top: 15px;

    border-top:
      1px solid
      ${COLORS.border};

    color:
      ${COLORS.muted};

    font-size: 8px;
  }

  .thread-footer span {
    margin:
      0 6px;

    color:
      ${COLORS.subtle};
  }

  /* =======================================================
     RESPONSIVO
  ======================================================= */

  @media (
    max-width: 900px
  ) {
    .thread-hero-top {
      flex-direction:
        column;

      align-items:
        flex-start;
    }

    .thread-hero-actions {
      width: 100%;
    }

    .thread-hero-stats {
      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );
    }
  }

  @media (
    max-width: 700px
  ) {
    .thread-shell {
      padding: 14px;

      border-radius: 20px;
    }

    .thread-hero {
      padding: 19px;
    }

    .thread-message-group {
      max-width: 82%;
    }

    .thread-info-row {
      grid-template-columns:
        1fr;
    }

    .thread-messages {
      min-height: 390px;

      height: 55vh;

      padding:
        16px 11px;
    }
  }

  @media (
    max-width: 520px
  ) {
    .thread-hero-identity {
      flex-direction:
        column;
    }

    .thread-hero-stats {
      grid-template-columns:
        1fr 1fr;
    }

    .thread-socket-badge {
      display: none;
    }

    .thread-message-group {
      max-width: 86%;
    }

    .thread-message-avatar {
      width: 25px;
      height: 25px;
    }

    .thread-composer-avatar {
      display: none;
    }

    .thread-composer-main {
      gap: 6px;
    }

    .thread-send-button {
      min-width: 48px;

      width: 48px;

      padding: 0;
    }

    .thread-send-label {
      display: none;
    }

    .thread-input-footer {
      display: none;
    }

    .thread-textarea {
      padding-bottom: 11px;
    }

    .thread-composer-status {
      justify-content:
        flex-start;
    }
  }

  @media (
    max-width: 400px
  ) {
    .thread-hero-stats {
      grid-template-columns:
        1fr;
    }

    .thread-hero h1 {
      font-size: 22px;
    }
  }
`;