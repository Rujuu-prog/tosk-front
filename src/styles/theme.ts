import { Button, Card, createTheme, TextInput } from "@mantine/core";

// リッチでシンプル（情報密度は保ちつつ清潔感重視）の初期テーマ
const theme = createTheme({
  // フォント: Geist を全体へ
  fontFamily:
    "var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
  headings: {
    fontFamily:
      "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    fontWeight: "600",
  },

  // 半径と影: 柔らかめの角丸 + 控えめな影
  defaultRadius: "lg",
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 2px 6px rgba(0,0,0,0.06)",
    md: "0 4px 14px rgba(0,0,0,0.08)",
    lg: "0 10px 24px rgba(0,0,0,0.12)",
    xl: "0 18px 40px rgba(0,0,0,0.16)",
  },

  // カラー: 落ち着いたブランド色（brand）を追加
  colors: {
    brand: [
      "#f7f3ff",
      "#efe7ff",
      "#dbc9ff",
      "#c0a4ff",
      "#a67eff",
      "#8d59ff",
      "#743df6",
      "#5f2fd4",
      "#4c26a8",
      "#3a1d80",
    ],
    // 中立系（微グレー）
    porcelain: [
      "#fbfbfd",
      "#f7f7fb",
      "#f1f1f6",
      "#e7e8ee",
      "#dfe0e8",
      "#caccd6",
      "#b1b4c1",
      "#9296a4",
      "#757a89",
      "#5d6270",
    ],
  },
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 4 },

  // コンポーネント既定（余白・サイズ・色の統一感）
  components: {
    Button: Button.extend({
      defaultProps: {
        radius: "lg",
        size: "md",
        variant: "filled",
        color: "brand",
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    }),
    Card: Card.extend({
      defaultProps: {
        radius: "lg",
        shadow: "sm",
        padding: "lg",
        withBorder: true,
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        radius: "lg",
        size: "md",
      },
    }),
  },
});

export default theme;
