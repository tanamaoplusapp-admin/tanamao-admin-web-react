export const SERVICES = [
  ['corrida_carro', 'Corrida de carro'],
  ['corrida_moto', 'Corrida de moto (onde permitido)'],
  ['entrega_moto', 'Entrega de moto'],
  ['entrega_carro', 'Entrega de carro'],
  ['frete_local', 'Frete local'],
  ['frete_intermunicipal', 'Frete intermunicipal'],
  ['frete_interestadual', 'Frete interestadual'],
  ['frete_internacional', 'Frete internacional'],
];
export const STATUS_PROFILE = [
  ['', 'Todos os status'],
  ['em_analise', 'Em análise'],
  ['incompleto', 'Incompleto'],
  ['aprovado', 'Aprovado'],
  ['reprovado', 'Reprovado'],
  ['suspenso', 'Suspenso'],
];
export const STATUS_JOB = [
  ['', 'Todas as viagens'],
  ['procurando', 'Procurando motorista'],
  ['ofertada', 'Oferta enviada'],
  ['aceita', 'Aceita'],
  ['no_local', 'No local'],
  ['em_andamento', 'Em andamento'],
  ['concluida', 'Concluída'],
  ['cancelada', 'Cancelada'],
  ['sem_motorista', 'Sem motorista'],
];
export const getServiceLabel = service => SERVICES.find(v => v[0] === service)?.[1] || service || '—';
export const getStatusLabel = status => [...STATUS_PROFILE, ...STATUS_JOB].find(v => v[0] === status)?.[1] || status || '—';
export const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100);
export const dateLabel = date => {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString('pt-BR') : '—';
};
export const dateOnly = date => {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleDateString('pt-BR') : '—';
};
export const centsInput = cents => (Number(cents || 0) / 100).toFixed(2).replace('.', ',');
export function inputCents(raw) {
  const s = String(raw ?? '').replace(/R\$/g, '').trim();
  if (!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(s)) throw new Error('Use valores positivos em reais, por exemplo 5,00 ou 2,50.');
  const cents = Math.round(Number(s.replace(',', '.')) * 100);
  if (!Number.isSafeInteger(cents) || cents > 10000000) throw new Error('Valor fora do limite permitido.');
  return cents;
}
export function shortLocation(point) {
  if (!point) return 'Não informado';
  if (typeof point === 'string') return point;
  const label = point.endereco || point.enderecoCompleto || point.descricao || point.formattedAddress || point.formatted_address || point.nome || point.label;
  if (label) return String(label);
  const city = point.cidade || point.city;
  const uf = point.uf || point.estado || point.region;
  const country = point.pais || point.country;
  return [city, uf, country].filter(Boolean).join(' · ') || 'Coordenadas registradas';
}
export const shortId = value => value ? `…${String(value).slice(-6)}` : '—';
