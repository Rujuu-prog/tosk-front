"use client";

import {
  Anchor,
  Box,
  Button,
  Card,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense,useEffect, useState } from "react";

import { authService } from "@/lib/auth";

interface ConfirmResetFormData {
  password: string;
  confirmPassword: string;
}

function PasswordResetConfirmContent() {
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ConfirmResetFormData>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
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
    },
  });

  useEffect(() => {
    // Check if token is present and has minimum length
    if (!token) {
      setTokenValid(false);
      return;
    }
    
    if (token.length < 10) {
      setTokenValid(false);
      return;
    }

    setTokenValid(true);
  }, [token]);

  const handleSubmit = async (values: ConfirmResetFormData) => {
    if (!token) {
      notifications.show({
        title: "エラー",
        message: "無効なリセットリンクです。",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset(token, values.password);

      notifications.show({
        title: "パスワードリセット完了",
        message: "パスワードが正常にリセットされました。新しいパスワードでログインしてください。",
        color: "green",
      });

      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "パスワードのリセットに失敗しました。もう一度お試しください。";

      notifications.show({
        title: "リセットエラー",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show error if token is invalid
  if (tokenValid === false) {
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
                <Box style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</Box>
                <Title order={2} c="red.6" mb="sm">
                  無効なリセットリンク
                </Title>
                <Text c="dimmed" size="md" maw={400} mx="auto">
                  パスワードリセットリンクが無効か、期限が切れています。
                  新しいリセットリンクをリクエストしてください。
                </Text>
              </Box>

              <Group justify="center" gap="sm">
                <Button
                  component={Link}
                  href="/auth/password-reset"
                  variant="filled"
                >
                  新しいリセットリンクを取得
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

  // Show loading while checking token
  if (tokenValid === null) {
    return (
      <Container size="sm" py={80}>
        <Card shadow="xl" radius="xl" p="xl">
          <Stack gap="lg" ta="center">
            <Text>リセットリンクを確認中...</Text>
          </Stack>
        </Card>
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
                <Box style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</Box>
                <Title order={1} size="h2" fw={700} c="brand.6">
                  新しいパスワードを設定
                </Title>
                <Text c="dimmed" size="sm" mt="xs" maw={400} mx="auto">
                  アカウントのセキュリティを保つため、
                  強力で他では使用していないパスワードを設定してください。
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
                      <PasswordInput
                        label="新しいパスワード"
                        size="md"
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
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <PasswordInput
                        label="パスワード確認"
                        size="md"
                        {...form.getInputProps("confirmPassword")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>🔐</Box>
                        }
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
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
                        パスワードを更新
                      </Button>
                    </motion.div>
                  </Stack>
                </form>
              </Paper>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Paper p="sm" radius="md" bg="blue.0">
                  <Text size="xs" c="blue.8" fw={500} mb="xs">
                    💡 安全なパスワードのヒント
                  </Text>
                  <Text size="xs" c="blue.7" style={{ lineHeight: 1.4 }}>
                    • 8文字以上の長さにする
                    <br />
                    • 英字と数字を組み合わせる
                    <br />
                    • 他のサイトで使用していない独自のパスワード
                    <br />
                    • 個人情報（名前、誕生日など）は避ける
                  </Text>
                </Paper>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <Group justify="center">
                  <Anchor component={Link} href="/auth/login" size="sm" c="dimmed">
                    ログイン画面に戻る
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

export default function PasswordResetConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordResetConfirmContent />
    </Suspense>
  );
}