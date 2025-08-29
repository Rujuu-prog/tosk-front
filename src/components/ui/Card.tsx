"use client";

import { Card as MantineCard, type CardProps } from "@mantine/core";

export type UICardProps = CardProps;

export function Card(props: UICardProps) {
  return <MantineCard {...props} />;
}

export default Card;

