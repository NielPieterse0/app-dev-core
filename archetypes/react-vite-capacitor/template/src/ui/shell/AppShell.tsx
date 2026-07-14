import type { ReactNode } from "react";
import "./app-shell.css";

type AppShellProps = {
  children: ReactNode;
  title?: string;
};

export function AppShell({ children, title = "__app_title__" }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1>{title}</h1>
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
