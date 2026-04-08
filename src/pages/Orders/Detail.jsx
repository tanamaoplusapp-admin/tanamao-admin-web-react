import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/orders";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError("Erro ao carregar serviço");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={page}>Carregando...</div>;
  if (error) return <div style={page}>{error}</div>;
  if (!order) return <div style={page}>Não encontrado</div>;

  return (
    <div style={page}>
      <button onClick={() => navigate("/orders")} style={backBtn}>
        ← Voltar
      </button>

      <h2 style={title}>Detalhe do Serviço</h2>

      <div style={grid}>

        <Card title="Serviço">
          <Info label="ID" value={order._id} />
          <Info label="Tipo" value={order.tipo} />
          <Info label="Status" value={order.status} />
          <Info label="Valor" value={money(order.valor)} />
          <Info label="Comissão" value={money(order.comissao)} />
          <Info label="Criado em" value={date(order.createdAt)} />
        </Card>

        <Card title="Cliente">
          <Info label="Nome" value={order.cliente?.name} />
          <Info label="Email" value={order.cliente?.email} />
          <Info label="Telefone" value={order.cliente?.phone} />
        </Card>

        <Card title="Prestador">
          <Info label="Nome" value={order.profissional?.name} />
          <Info label="Plano" value={order.profissional?.plano} />
          <Info label="Avaliação" value={order.profissional?.rating} />
          <Info label="Cidade" value={order.profissional?.cidade} />
        </Card>

        <Card title="Local">
          <Info label="Endereço" value={order.endereco} />
          <Info label="Cidade" value={order.cidade} />
          <Info label="Latitude" value={order.lat} />
          <Info label="Longitude" value={order.lng} />
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
      <div>{value || "-"}</div>
    </div>
  );
}

function money(v) {
  if (!v) return "-";
  return `R$ ${Number(v).toFixed(2)}`;
}

function date(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

const page = {
  padding: 24,
  background: "#F9FAFB",
  minHeight: "100vh"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 20
};

const backBtn = {
  background: "transparent",
  border: "none",
  marginBottom: 20,
  cursor: "pointer",
  fontWeight: 700
};

const title = {
  fontSize: 22,
  fontWeight: 900,
  marginBottom: 20
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #E5E7EB"
};

const cardTitle = {
  fontWeight: 800,
  marginBottom: 12
};

const info = {
  marginBottom: 12
};