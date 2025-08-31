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
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/contexts/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();

  const form = useForm<LoginFormData>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => {
        if (!value) return "メールアドレスを入力してください";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : "正しいメールアドレス形式で入力してください";
      },
      password: (value) => {
        if (!value) return "パスワードを入力してください";
        return value.length < 8 ? "パスワードは8文字以上で入力してください" : null;
      },
    },
  });

  const handleSubmit = async (values: LoginFormData) => {
    try {
      await login(values.email, values.password);
      
      notifications.show({
        title: "ログイン成功",
        message: "ようこそ！",
        color: "green",
      });

      router.push("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "ログインに失敗しました。もう一度お試しください。";

      notifications.show({
        title: "ログインエラー",
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
                  Todo + SNSで、もっと楽しく、もっと効率的に
                </Text>
              </Box>

              <Paper p="md" radius="md" bg="gray.0">
                <Text size="sm" fw={600} c="brand.7" mb="sm">
                  ログイン
                </Text>
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
                        {...form.getInputProps("email")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>📧</Box>
                        }
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <PasswordInput
                        label="パスワード"
                        {...form.getInputProps("password")}
                        leftSection={
                          <Box style={{ fontSize: "16px" }}>🔒</Box>
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
                        ログイン
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
                <Group justify="center" gap="xs">
                  <Text size="sm" c="dimmed">
                    アカウントをお持ちでない方は
                  </Text>
                  <Anchor component={Link} href="/auth/signup" size="sm" fw={600}>
                    新規登録
                  </Anchor>
                </Group>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <Group justify="center">
                  <Anchor component={Link} href="/auth/password-reset" size="xs" c="dimmed">
                    パスワードを忘れた方
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