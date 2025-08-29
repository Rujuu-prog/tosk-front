"use client";

import { Container, Stack } from "@mantine/core";

type PageContainerProps = {
  children: React.ReactNode;
  size?: number | string;
  withGap?: boolean;
};

export default function PageContainer({ children, size = "lg", withGap = true }: PageContainerProps) {
  if (withGap) {
    return (
      <Container size={size} pt="xl" pb="xl">
        <Stack gap="lg">{children}</Stack>
      </Container>
    );
  }
  return (
    <Container size={size} pt="xl" pb="xl">
      {children}
    </Container>
  );
}

