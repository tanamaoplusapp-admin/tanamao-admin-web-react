import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../../layout/Page";
import API from "../../services/api";

export default function UserDetail() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [trialDate, setTrialDate] = useState("");
const avatar =
  user?.photoUrl ||
  user?.foto ||
  user?.avatar ||
  user?.image ||
  user?.profissional?.photoUrl ||
  user?.profileImage;
  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);

      const res = await API.get(`/admin/users/${id}`);
      const userData = res.data?.user || res.data;

      setUser(userData);

    } catch (e) {
      console.error(e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

 function getOnlineStatus() {
  if (user?.online === true) {
    return "🟢 Disponível";
  }

  if (user?.online === false) {
    return "⚪ Indisponível";
  }

  return "—";
}

  function getAccountStatus() {
    if (user?.status === "blocked") return "🔴 Bloqueado";
    return "🟢 Ativo";
  }

  function getFinancialStatus() {
    if (!user?.subscriptionStatus) return "—";

    switch (user.subscriptionStatus) {
      case "active":
        return "🟢 Ativo";
      case "overdue":
        return "🔴 Atrasado";
      case "trial":
        return "🟡 Trial";
      default:
        return "—";
    }
  }

  function getBillingType() {
    switch (user?.billingType) {
      case "daily":
        return "Diário";
      case "weekly":
        return "Semanal";
      case "monthly":
        return "Mensal";
      default:
        return "—";
    }
  }
function getAccessStatus() {
  if (!user?.acessoExpiraEm) return "—";

  const exp = new Date(user.acessoExpiraEm);
  const now = new Date();

  if (exp < now) return "🔴 Expirado";

  return "🟢 Ativo até " + exp.toLocaleDateString("pt-BR");
}
function Actions({ children }) {
  return <div style={actions}>{children}</div>;
}

function Action({ label, onClick, danger, warn }) {
  let bg = "#14532D";
  if (warn) bg = "#F59E0B";
  if (danger) bg = "#DC2626";

  return (
    <button onClick={onClick} style={{ ...btn, background: bg }}>
      {label}
    </button>
  );
}
  async function handleUserStatus(status) {
    if (!window.confirm("Confirmar ação?")) return;

    try {
      setActionLoading(true);

      await API.patch(`/admin/users/${id}/status`, {
        status,
      });

      setUser(prev => ({
        ...prev,
        status
      }));

    } finally {
      setActionLoading(false);
    }
  }async function handleExtendAccess(days) {
  if (!window.confirm("Confirmar liberação?")) return;

  try {
    setActionLoading(true);

    await API.patch(`/admin/users/${id}/extend-access`, {
      days
    });

    load();

  } finally {
    setActionLoading(false);
  }
}

  async function handleFinancialAction(action) {
    try {
      setActionLoading(true);

      await API.patch(
        `/admin/users/${id}/financial-status`,
        { action, trialEndsAt: trialDate }
      );

      load();

    } finally {
      setActionLoading(false);
    }
  }

  async function openChat() {
    window.location.href = `/chat/${user._id}`;
  }

  if (loading)
    return <Page title="Usuário">Carregando...</Page>;

  if (!user)
    return <Page title="Usuário">Não encontrado</Page>;

  return (
    <Page title="Usuário" subtitle={user.email}>

      <Card title="Conta">

        

{avatar && (
  <img
    src={avatar}
    style={{
      width: 90,
      height: 90,
      borderRadius: 50,
      marginBottom: 20,
      objectFit: "cover"
    }}
  />
)}

        <Grid>
          <Info label="Nome" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Perfil" value={user.role} />
          <Info label="Profissão" value={user.profissao} />
          <Info label="Telefone" value={user.phone} />
          <Info label="CPF" value={user.cpf} />
          <Info label="Status" value={getAccountStatus()} />
          <Info label="Online" value={getOnlineStatus()} />
          <Info label="Criado" value={formatDate(user.createdAt)} />
          <Info label="Último login" value={formatDate(user.lastLoginAt)} />
        </Grid>

        <Actions>
          <Action
            label="Bloquear usuário"
            danger
            onClick={() => handleUserStatus("blocked")}
          />

          <Action
            label="Desbloquear usuário"
            onClick={() => handleUserStatus("active")}
          />

          <Action
            label="Abrir chat"
            onClick={openChat}
          />
        </Actions>
      </Card>

      {user.role === "profissional" && (
        <Card title="Financeiro"><Info
  label="Acesso ativo"
  value={getAccessStatus()}
/>
          <Grid>
            <Info label="Plano" value={getBillingType()} />
            <Info label="Status" value={getFinancialStatus()} />
            <Info label="Trial até" value={formatDate(user.trialEndsAt)} />
            <Info label="Vence em" value={formatDate(user.subscriptionExpiresAt)} />
          </Grid>

          <Actions>

<Action
  label="Liberar 7 dias"
  onClick={() => handleExtendAccess(7)}
/>

<Action
  label="Liberar 15 dias"
  onClick={() => handleExtendAccess(15)}
/>

<Action
  label="Liberar 30 dias"
  onClick={() => handleExtendAccess(30)}
/>

<Action
  label="Liberar permanente"
  onClick={() => handleExtendAccess(3650)}
/>

<Action
  label="Bloquear acesso"
  danger
  onClick={handleExpireNow}
/>

</Actions>
        </Card>
      )}

      {user.role === "profissional" && (
        <Card title="Serviços">
          <Grid>

            <Info
              label="Recebidos"
              value={user.jobsReceived || 0}
            />

            <Info
              label="Aceitos"
              value={user.jobsAccepted || 0}
            />

            <Info
              label="Recusados"
              value={user.jobsRejected || 0}
            />

            <Info
              label="Em andamento"
              value={user.jobsActive || 0}
            />

            <Info
              label="Finalizados"
              value={user.jobsCompleted || 0}
            />

            <Info
              label="Cliente atual"
              value={user?.currentClient?.name}
            />

          </Grid>
        </Card>
      )}

    </Page>
  );
}

/* COMPONENTES */


async function handleExpireNow() {
  if (!window.confirm("Bloquear acesso deste prestador?")) return;

  try {
    setActionLoading(true);

    await API.patch(`/admin/users/${id}/expire-access`);

    load();

  } finally {
    setActionLoading(false);
  }
}
function Card({ title, children }) {
  return (
    <div style={card}>
      <h3 style={cardTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div style={grid}>{children}</div>;
}

function Info({ label, value }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value || "—"}</div>
    </div>
  );
}


const card = {
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  marginBottom: 24,
  border: "1px solid #E5E7EB"
};

const cardTitle = {
  fontWeight: 700,
  marginBottom: 16
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 16
};

const labelStyle = {
  fontSize: 12,
  color: "#6B7280"
};

const valueStyle = {
  fontWeight: 700
};

const actions = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap"
};

const btn = {
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer"
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}