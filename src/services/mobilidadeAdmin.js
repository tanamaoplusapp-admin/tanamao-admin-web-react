import API from './api';

const ROOT = '/admin/mobilidade';

export const getMobilityProfiles = ({ status = '', page = 1 } = {}) =>
  API.get(`${ROOT}/perfis`, { params: { ...(status ? { status } : {}), page } }).then(r => r.data);
export const getMobilityProfile = profileId =>
  API.get(`${ROOT}/perfis/${encodeURIComponent(profileId)}`).then(r => r.data);
export const reviewMobilityCnh = (profileId, body) =>
  API.patch(`${ROOT}/perfis/${encodeURIComponent(profileId)}/cnh`, body).then(r => r.data);
export const reviewMobilityProfile = (profileId, body) =>
  API.patch(`${ROOT}/perfis/${encodeURIComponent(profileId)}/aprovacao`, body).then(r => r.data);
export const reviewMobilityVehicle = (vehicleId, body) =>
  API.patch(`${ROOT}/veiculos/${encodeURIComponent(vehicleId)}/aprovacao`, body).then(r => r.data);
export const downloadMobilityDocument = documentId =>
  API.get(`${ROOT}/documentos/${encodeURIComponent(documentId)}/download`, { responseType: 'blob' }).then(r => r.data);
export const getMotoPolicies = ({status = '', busca = '', page = 1} = {}) =>
  API.get(`${ROOT}/permissoes-moto`, {params:{...(status?{status}:{}),...(busca?{busca}:{}),page}}).then(r => r.data);
export const reviewMotoPolicy = (chave, body) =>
  API.patch(`${ROOT}/permissoes-moto/${encodeURIComponent(chave)}`, body).then(r => r.data);
export const getMobilityTariffs = () => API.get(`${ROOT}/tarifas`).then(r => r.data);
export const saveMobilityTariff = body => API.put(`${ROOT}/tarifas`, body).then(r => r.data);
export const seedMobilityTariffs = () =>
  API.post(`${ROOT}/tarifas/iniciais`, { confirmacao: 'HOMOLOGAR_TARIFAS' }).then(r => r.data);
export const getMobilityJobs = status =>
  API.get(`${ROOT}/solicitacoes`, { params: status ? { status } : {} }).then(r => r.data);
export const cancelMobilityJob = (jobId, motivo) =>
  API.post(`${ROOT}/solicitacoes/${encodeURIComponent(jobId)}/cancelar`, { motivo }).then(r => r.data);
export const unlockMobilityPin = jobId =>
  API.post(`${ROOT}/solicitacoes/${encodeURIComponent(jobId)}/desbloquear-pin`, {}).then(r => r.data);

export function mobilityError(error) {
  const code = error?.response?.status;
  const detail = error?.response?.data?.erro || error?.response?.data?.error || error?.response?.data?.message;
  if (detail) return detail;
  if (code === 401) return 'Sua sessão expirou ou não foi reconhecida. Entre novamente no painel.';
  if (code === 403) return 'Sua conta não tem autorização para administrar Mobilidade.';
  if (code === 404) return 'O backend publicado ainda não possui essa rota de Mobilidade.';
  if (code === 503) return 'O módulo de Mobilidade está desativado ou temporariamente indisponível.';
  if (!error?.response) return 'Não foi possível contactar a API. Confira a URL, o Render e sua conexão.';
  return `Não foi possível concluir a operação (HTTP ${code || '?'})`;
}

export const getDynamicSchedule = () => API.get(`${ROOT}/tarifas/dinamica`).then(r => r.data);
export const saveDynamicSchedule = body => API.put(`${ROOT}/tarifas/dinamica`, body).then(r => r.data);
export const deleteDynamicSchedule = body => API.delete(`${ROOT}/tarifas/dinamica`, {data:body}).then(r => r.data);

export const getMobilityOperationalSummary = () => API.get(`${ROOT}/operacao/resumo`).then(r => r.data);
