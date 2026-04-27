export const clerkAppearance = {
  variables: {
    colorPrimary: "#fafafa",
    colorBackground: "#0a0a0a",
    colorText: "#fafafa",
    colorTextSecondary: "#a3a3a3",
    colorInputBackground: "#111111",
    colorInputText: "#fafafa",
    colorNeutral: "#fafafa",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    card: {
      backgroundColor: "transparent",
      boxShadow: "none",
      border: "1px solid #1f1f1f",
      borderRadius: "1rem",
      padding: "1.75rem",
    },
    headerTitle: {
      color: "#fafafa",
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    headerSubtitle: {
      color: "#a3a3a3",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#161616",
      borderRadius: "9999px",
      borderColor: "#2a2a2a",
      color: "#fafafa",
      "&:hover": {
        backgroundColor: "#1c1c1c",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#fafafa",
      fontWeight: 500,
    },
    dividerLine: {
      backgroundColor: "#1f1f1f",
    },
    dividerText: {
      color: "#8a8a8a",
    },
    formFieldLabel: {
      color: "#a3a3a3",
      fontSize: "0.78rem",
      fontWeight: 500,
      letterSpacing: "0.04em",
    },
    formFieldInput: {
      backgroundColor: "#111111",
      borderColor: "#1f1f1f",
      borderRadius: "0.75rem",
      color: "#fafafa",
      "&:focus": {
        borderColor: "#2a2a2a",
        boxShadow: "0 0 0 3px rgba(245, 181, 107, 0.15)",
      },
    },
    formButtonPrimary: {
      backgroundColor: "#fafafa",
      color: "#0a0a0a",
      borderRadius: "9999px",
      fontWeight: 600,
      textTransform: "none",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#e5e5e5",
      },
    },
    footer: {
      backgroundColor: "transparent",
      "& + div": {
        backgroundColor: "transparent",
      },
    },
    footerAction: {
      color: "#a3a3a3",
    },
    footerActionLink: {
      color: "#fafafa",
      fontWeight: 600,
      "&:hover": {
        color: "#f5b56b",
      },
    },
    identityPreviewText: {
      color: "#fafafa",
    },
    identityPreviewEditButton: {
      color: "#f5b56b",
    },
    formFieldInputShowPasswordButton: {
      color: "#a3a3a3",
    },
    formResendCodeLink: {
      color: "#f5b56b",
    },
  },
} as const;
