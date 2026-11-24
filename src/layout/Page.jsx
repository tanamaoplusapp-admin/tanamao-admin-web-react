export default function Page({ title, subtitle, children }) {
  return (
    <div style={page}>
      {title && <h2 style={titleStyle}>{title}</h2>}
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      <div>{children}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  color: "var(--ad-text)",
};

const titleStyle = {
  fontSize: 22,
  fontWeight: 900,
  color: "var(--ad-accent-text)",
  marginBottom: 4,
};

const subtitleStyle = {
  marginBottom: 20,
  color: "var(--ad-text)",
};
