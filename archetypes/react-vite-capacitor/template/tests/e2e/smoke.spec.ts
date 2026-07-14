import { expect, test } from "@playwright/test";

test("adds an item, reloads, and keeps it", async ({ page }) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto("/");
  await page.getByLabel("New item title").fill("Buy milk");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Buy milk")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Buy milk")).toBeVisible();

  expect(errors, `console/page errors: ${errors.join("; ")}`).toHaveLength(0);
});
