import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "./ui/shell/AppShell.js";
import { ItemsView } from "./ui/shell/ItemsView.js";
import { createExampleItemRepository } from "./platform/composition.js";

async function bootstrap() {
  const itemRepository = await createExampleItemRepository();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppShell title="__app_title__">
        <ItemsView repo={itemRepository} />
      </AppShell>
    </StrictMode>
  );
}

void bootstrap();
