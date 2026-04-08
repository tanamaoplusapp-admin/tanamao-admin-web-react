/**
 * ADMIN ACCESS GUARD
 * Decisão temporária e segura
 * NÃO altera backend
 */

const ADMIN_EMAILS = [
  "marcela@tanamao.com",
  // adicionar outros admins aqui
];

export function isAdminUser(user) {
  if (!user) return false;

  // regra primária (mais segura)
  if (ADMIN_EMAILS.includes(user.email)) return true;

  // fallback futuro (se backend tiver role)
  if (user.role === "admin") return true;

  return false;
}
