import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get(`/servicos/${id}`);
      const data = res.data;

      setService(data?.service || data?.servico || data || null);
    } catch (err) {
      console.error("[OrderDetail] Erro ao carregar serviço:", err);
      setError("Erro ao carregar serviço");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={page}>Carregando...</div>;
  if (error) return <div style={page}>{error}</div>;
  if (!service) return <div style={page}>Não encontrado</div>;

  const longitude = service.location?.coordinates?.[0];
  const latitude = service.location?.coordinates?.[1];

  const valor =
    service.valorFinal ??
    service.price ??
    service.valor ??
    null;

  return (
    <div style={page}>
      <button onClick={() => navigate("/orders")} style={backBtn}>
        ← Voltar
      </button>

      <h2 style={title}>Detalhe do Serviço</h2>

      <div style={grid}>
        <Card title="Serviço">
          <Info label="ID" value={service._id} />
          <Info label="Tipo" value={tipoServicoLabel(service.tipoServico)} />
          <Info label="Categoria" value={service.categoria} />
          <Info label="Descrição" value={service.descricao} />
          <Info label="Status" value={statusLabel(service.status)} />
          <Info label="Urgente" value={service.urgente ? "Sim" : "Não"} />
          <Info label="Valor" value={money(valor)} />
          <Info label="Criado em" value={date(service.createdAt)} />
        </Card>

        <Card title="Cliente">
          <Info label="Nome" value={service.cliente?.name || service.cliente?.nome} />
          <Info label="Email" value={service.cliente?.email} />
          <Info
            label="Telefone"
            value={
              service.cliente?.telefone ||
              service.cliente?.phone ||
              service.cliente?.celular
            }
          />
        </Card>

        <Card title="Prestador">
          <Info
            label="Nome"
            value={service.profissional?.name || service.profissional?.nome}
          />
          <Info label="Email" value={service.profissional?.email} />
          <Info
            label="Telefone"
            value={
              service.profissional?.telefone ||
              service.profissional?.phone ||
              service.profissional?.celular
            }
          />
        </Card>

        <Card title="Localização">
          <Info label="Endereço" value={service.endereco} />
          <Info label="Latitude" value={latitude} />
          <Info label="Longitude" value={longitude} />
        </Card>

        <Card title="Agendamento">
          <Info label="Data agendada" value={service.dataAgendada} />
          <Info label="Hora agendada" value={service.horaAgendada} />
          <Info label="Valor final" value={money(service.valorFinal)} />
        </Card>

        <Card title="Pagamento">
          <Info label="Método" value={paymentMethodLabel(service.payment?.method)} />
          <Info label="Status" value={paymentStatusLabel(service.payment?.status)} />
          <Info label="TX ID" value={service.payment?.txId} />
        </Card>

        <Card title="Chat">
          <Info label="Chat ID" value={service.chatId?._id || service.chatId} />
        </Card>

        <Card title="Métricas">
          <Info label="Respondido em" value={date(service.respondidoEm)} />
          <Info
            label="Tempo de resposta"
            value={seconds(service.tempoRespostaSegundos)}
          />
          <Info label="SLA expira em" value={date(service.slaExpiraEm)} />
          <Info label="Expirado" value={service.expirado ? "Sim" : "Não"} />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={card}>
      <div style={cardTitle}>{title}</div>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={info}>
      <strong>{label}</strong>
      <div>{formatValue(value)}</div>
    </div>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function money(v) {
  if (v === null || v === undefined || v === "") return "-";

  const number = Number(v);

  if (!Number.isFinite(number)) return "-";

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function date(d) {
  if (!d) return "-";

  const parsed = new Date(d);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("pt-BR");
}

function seconds(v) {
  if (v === null || v === undefined || v === "") return "-";

  const number = Number(v);

  if (!Number.isFinite(number)) return "-";

  if (number < 60) return `${number}s`;

  const minutes = Math.floor(number / 60);
  const remainingSeconds = number % 60;

  return `${minutes}min ${remainingSeconds}s`;
}

function tipoServicoLabel(tipo) {
  const map = {
    normal: "Normal",
    orcamento: "Orçamento",
    agendado: "Agendado",
    emergencial: "Emergencial",
  };

  return map[tipo] || tipo || "-";
}

function statusLabel(status) {
  const map = {
    pendente: "Pendente",
    aceito: "Aceito",
    em_rota: "Em rota",
    pago: "Pago",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
    expirado: "Expirado",
  };

  return map[status] || status || "-";
}

function paymentMethodLabel(method) {
  const map = {
    Pix: "PIX",
    pix: "PIX",
    Cartao: "Cartão",
    card: "Cartão",
    cash: "Dinheiro",
    Dinheiro: "Dinheiro",
  };

  return map[method] || method || "-";
}

function paymentStatusLabel(status) {
  const map = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    refunded: "Estornado",
  };

  return map[status] || status || "-";
}

const page = {
  padding: 24,
  background: "#F9FAFB",
  minHeight: "100vh",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 20,
};

const backBtn = {
  background: "transparent",
  border: "none",
  marginBottom: 20,
  cursor: "pointer",
  fontWeight: 700,
};

const title = {
  fontSize: 22,
  fontWeight: 900,
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
};

const cardTitle = {
  fontWeight: 800,
  marginBottom: 12,
};

const info = {
  marginBottom: 12,
};