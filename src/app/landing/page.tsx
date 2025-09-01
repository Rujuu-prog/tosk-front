"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <Container size="xl" py={80}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box ta="center" py={80}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Title
              order={1}
              size="4rem"
              fw={800}
              c="brand.6"
              mb="xl"
              style={{
                background: "linear-gradient(135deg, #743df6 0%, #8d59ff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tosk
            </Title>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Text
              size="xl"
              c="dimmed"
              maw={600}
              mx="auto"
              mb="xl"
              style={{ lineHeight: 1.6 }}
            >
              Todo + SNSで、もっと楽しく、もっと効率的に。
              <br />
              チームと一緒に成長する、新しい生産性体験。
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Group justify="center" gap="lg">
              <Button
                component={Link}
                href="/auth/signup"
                size="lg"
                radius="lg"
                gradient={{ from: "brand.6", to: "brand.4" }}
                variant="gradient"
                style={{
                  boxShadow: "0 6px 20px rgba(116, 61, 246, 0.3)",
                }}
                px={40}
              >
                今すぐ始める
              </Button>
              <Button
                component={Link}
                href="/auth/login"
                size="lg"
                radius="lg"
                variant="outline"
                color="brand"
                px={40}
              >
                ログイン
              </Button>
            </Group>
          </motion.div>
        </Box>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <Grid py={80}>
          <Grid.Col span={4}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Box ta="center" p="lg">
                <Box
                  style={{
                    fontSize: "4rem",
                    marginBottom: "1rem",
                  }}
                >
                  📝
                </Box>
                <Title order={3} mb="sm" c="brand.7">
                  スマートなタスク管理
                </Title>
                <Text c="dimmed" size="sm">
                  直感的なUIでタスクを管理。進捗状況を視覚的に把握し、生産性を向上させましょう。
                </Text>
              </Box>
            </motion.div>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Box ta="center" p="lg">
                <Box
                  style={{
                    fontSize: "4rem",
                    marginBottom: "1rem",
                  }}
                >
                  👥
                </Box>
                <Title order={3} mb="sm" c="brand.7">
                  チームコラボレーション
                </Title>
                <Text c="dimmed" size="sm">
                  チームメンバーと連携してプロジェクトを推進。リアルタイムでの情報共有が可能です。
                </Text>
              </Box>
            </motion.div>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Box ta="center" p="lg">
                <Box
                  style={{
                    fontSize: "4rem",
                    marginBottom: "1rem",
                  }}
                >
                  🚀
                </Box>
                <Title order={3} mb="sm" c="brand.7">
                  モチベーション向上
                </Title>
                <Text c="dimmed" size="sm">
                  SNS機能でタスクの達成を共有。チーム全体のモチベーションを高めます。
                </Text>
              </Box>
            </motion.div>
          </Grid.Col>
        </Grid>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <Box
          ta="center"
          py={80}
          px={40}
          style={{
            background: "linear-gradient(135deg, #f7f3ff 0%, #efe7ff 100%)",
            borderRadius: "2rem",
          }}
        >
          <Title order={2} mb="md" c="brand.8">
            今すぐToskを始めよう
          </Title>
          <Text c="dimmed" mb="xl" size="lg">
            無料でアカウントを作成して、新しい生産性体験を始めましょう
          </Text>
          <Button
            component={Link}
            href="/auth/signup"
            size="xl"
            radius="xl"
            gradient={{ from: "brand.6", to: "brand.4" }}
            variant="gradient"
            style={{
              boxShadow: "0 8px 24px rgba(116, 61, 246, 0.25)",
            }}
            px={50}
          >
            無料で始める
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}