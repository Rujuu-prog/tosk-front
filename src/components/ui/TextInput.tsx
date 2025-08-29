"use client";

import { TextInput as MantineTextInput, type TextInputProps } from "@mantine/core";

export type UITextInputProps = TextInputProps;

export function TextInput(props: UITextInputProps) {
  return <MantineTextInput {...props} />;
}

export default TextInput;

