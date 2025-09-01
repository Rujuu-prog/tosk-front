"use client";

import {
  Anchor,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/contexts/AuthContext";

interface SignupFormData {
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading } = useAuth();

  const form = useForm<SignupFormData>({
    initialValues: {
      username: "",
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validate: {
      username: (value) => {
        if (!value) return "ユーザー名を入力してください";
        if (value.length < 3 || value.length > 20) return "ユーザー名は3-20文字で入力してください";
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return "ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます";
        return null;
      },
      email: (value) => {
        if (!value) return "メールアドレスを入力してください";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : "正しいメールアドレス形式で入力してください";
      },
      displayName: (value) => {
        if (!value) return "表示名を入力してください";
        if (value.length > 50) return "表示名は50文字以下で入力してください";
        return null;
      },
      password: (value) => {
        if (!value) return "パスワードを入力してください";
        if (value.length < 8) return "パスワードは8文字以上で入力してください";
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) return "パスワードは英字と数字を含む必要があります";
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return "パスワード確認を入力してください";
        return value === values.password ? null : "パスワードが一致しません";
      },
      agreeToTerms: (value) => {
        return value ? null : "利用規約に同意してください";
      },
    },
  });

  const handleSubmit = async (values: SignupFormData) => {
    try {
      await signup(values.email, values.username, values.displayName, values.password);

      notifications.show({
        title: "アカウント作成完了",
        message: "Toskへようこそ！ダッシュボードに移動します。",
        color: "green",
      });

      router.push("/");
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "アカウントの作成に失敗しました。もう一度お試しください。";

      notifications.show({
        title: "登録エラー",
        message: errorMessage,
        color: "red",
      });
    }
  };

  return (
    <Container size="sm" py={80}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card shadow="xl" radius="xl" p="xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Stack gap="lg">
              <Box ta="center">
                <Title order={1} size="h2" fw={700} c="brand.6">
                  Tosk
                </Title>
                <Text c="dimmed" size="sm" mt="xs">
                  新しい生産性の体験を始めましょう
                </Text>
              </Box>

              <Paper p="md" radius="md">
                <Text size="sm" fw={600} c="brand.7" mb="sm">
                  新規アカウント作成
                </Text>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <TextInput
                        label="ユーザー名"
                        placeholder="your_username"
                        {...form.getInputProps("username")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>👤</Box>
                        }
                        description="3-20文字の英数字、アンダースコア、ハイフンが使用できます"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <TextInput
                        label="メールアドレス"
                        placeholder="your@email.com"
                        type="email"
                        {...form.getInputProps("email")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>📧</Box>
                        }
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45, duration: 0.4 }}
                    >
                      <TextInput
                        label="表示名"
                        placeholder="田中 太郎"
                        {...form.getInputProps("displayName")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>🏷️</Box>
                        }
                        description="他のユーザーに表示される名前"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <PasswordInput
                        label="パスワード"
                        {...form.getInputProps("password")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>🔒</Box>
                        }
                        description="8文字以上で英字と数字を含む"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55, duration: 0.4 }}
                    >
                      <PasswordInput
                        label="パスワード確認"
                        {...form.getInputProps("confirmPassword")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>🔐</Box>
                        }
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <Checkbox
                        {...form.getInputProps("agreeToTerms", { type: "checkbox" })}
                        label={
                          <Text size="sm">
                            <Anchor href="#" size="sm">利用規約</Anchor>
                            および
                            <Anchor href="#" size="sm">プライバシーポリシー</Anchor>
                            に同意します
                          </Text>
                        }
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65, duration: 0.4 }}
                    >
                      <Button
                        type="submit"
                        loading={loading}
                        fullWidth
                        size="lg"
                        radius="lg"
                        gradient={{ from: "brand.6", to: "brand.4" }}
                        variant="gradient"
                        style={{
                          boxShadow: "0 4px 14px rgba(116, 61, 246, 0.25)",
                        }}
                      >
                        アカウントを作成
                      </Button>
                    </motion.div>
                  </Stack>
                </form>
              </Paper>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <Group justify="center" gap="xs">
                  <Text size="sm" c="dimmed">
                    すでにアカウントをお持ちの方は
                  </Text>
                  <Anchor component={Link} href="/auth/login" size="sm" fw={600}>
                    ログイン
                  </Anchor>
                </Group>
              </motion.div>
            </Stack>
          </motion.div>
        </Card>
      </motion.div>
    </Container>
  );
}