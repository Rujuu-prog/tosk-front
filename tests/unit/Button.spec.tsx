import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Providers from "@/app/providers";
import { Button } from "@/components/ui/Button";

describe("UI Button", () => {
  it("renders with provided label", () => {
    render(
      <Providers>
        <Button>Click me</Button>
      </Providers>
    );
    expect(screen.getByRole("button", { name: /click me/i })).toBeVisible();
  });
});
