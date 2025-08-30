"use client";

import { Group, Title } from "@mantine/core";

type SectionProps = {
  title: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Section({ title, right, children }: SectionProps) {
  return (
    <section>
      <Group justify="space-between" mb="md">
        <Title order={3}>{title}</Title>
        {right}
      </Group>
      {children}
    </section>
  );
}

