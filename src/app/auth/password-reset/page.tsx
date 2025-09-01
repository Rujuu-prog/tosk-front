"use client";

import {
  Anchor,
  Box,
  Button,
  Card,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { authService } from "@/lib/auth";

interface ResetFormData {
  email: string;
}

export default function PasswordResetPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ResetFormData>({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => {
        if (!value) return "メールアドレスを入力してください";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : "正しいメールアドレス形式で入力してください";
      },
    },
  });

  const handleSubmit = async (values: ResetFormData) => {
    setLoading(true);
    try {
      await authService.requestPasswordReset(values.email);

      setSubmitted(true);
      notifications.show({
        title: "パスワードリセットメール送信完了",
        message: "メールアドレスにパスワードリセットのリンクを送信しました。",
        color: "green",
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "パスワードリセットメールの送信に失敗しました。もう一度お試しください。";

      notifications.show({
        title: "送信エラー",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Container size="sm" py={80}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card shadow="xl" radius="xl" p="xl">
            <Stack gap="lg" ta="center">
              <Box>
                <Box style={{ fontSize: "4rem", marginBottom: "1rem" }}>📧</Box>
                <Title order={2} c="brand.6" mb="sm">
                  メールを送信しました
                </Title>
                <Text c="dimmed" size="md" maw={400} mx="auto">
                  {form.values.email} にパスワードリセットのリンクを送信しました。
                  メールをご確認の上、リンクをクリックしてパスワードをリセットしてください。
                </Text>
              </Box>

              <Paper p="md" radius="md" bg="blue.0">
                <Text size="sm" c="blue.8" fw={500}>
                  💡 ヒント
                </Text>
                <Text size="sm" c="blue.7" mt="xs">
                  メールが届かない場合は、迷惑メールフォルダもご確認ください。
                  15分経ってもメールが届かない場合は、再度お試しください。
                </Text>
              </Paper>

              <Group justify="center" gap="sm">
                <Button
                  variant="light"
                  onClick={() => {
                    setSubmitted(false);
                    form.reset();
                  }}
                >
                  再送信する
                </Button>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outline"
                >
                  ログイン画面に戻る
                </Button>
              </Group>
            </Stack>
          </Card>
        </motion.div>
      </Container>
    );
  }

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
                <Box style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔑</Box>
                <Title order={1} size="h2" fw={700} c="brand.6">
                  パスワードリセット
                </Title>
                <Text c="dimmed" size="sm" mt="xs" maw={400} mx="auto">
                  登録時のメールアドレスを入力してください。
                  パスワードリセット用のリンクをお送りします。
                </Text>
              </Box>

              <Paper p="md" radius="md" bg="gray.0">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <TextInput
                        label="メールアドレス"
                        placeholder="your@email.com"
                        type="email"
                        size="md"
                        {...form.getInputProps("email")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>📧</Box>
                        }
                        description="このメールアドレスでアカウントを登録している必要があります"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
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
                        リセットメールを送信
                      </Button>
                    </motion.div>
                  </Stack>
                </form>
              </Paper>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Group justify="center" gap="xs">
                  <Text size="sm" c="dimmed">
                    パスワードを思い出しましたか？
                  </Text>
                  <Anchor component={Link} href="/auth/login" size="sm" fw={600}>
                    ログイン
                  </Anchor>
                </Group>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Group justify="center" gap="xs">
                  <Text size="sm" c="dimmed">
                    アカウントをお持ちでない方は
                  </Text>
                  <Anchor component={Link} href="/auth/signup" size="sm" fw={600}>
                    新規登録
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