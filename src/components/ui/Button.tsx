"use client";

import { Button as MantineButton, type ButtonProps } from "@mantine/core";

export type UIButtonProps = ButtonProps & {
  // ここでアプリ共通の拡張Propsを追加可能
};

export function Button(props: UIButtonProps) {
  return <MantineButton {...props} />;
}

export default Button;

