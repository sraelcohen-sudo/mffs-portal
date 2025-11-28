export default function RoleChip({ role }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.25rem 0.55rem",
        borderRadius: "999px",
        border: "1px solid rgba(94,234,212,0.5)",
        background:
          "radial-gradient(circle at top left, rgba(45,212,191,0.14), rgba(15,23,42,1))",
        color: "#a7f3d0",
        fontSize: "0.72rem",
        fontWeight: 500,
        letterSpacing: "0.04em",
        marginBottom: "0.8rem"
      }}
    >
      <span
        style={{
          width: "0.45rem",
          height: "0.45rem",
          borderRadius: "50%",
          backgroundColor: "#5eead4"
        }}
      />
      {role} portal
    </div>
  );
}
