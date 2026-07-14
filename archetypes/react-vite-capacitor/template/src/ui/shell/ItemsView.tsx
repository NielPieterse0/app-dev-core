import { useState } from "react";
import type { ItemRepository } from "@/data/ports/ItemRepository.js";
import { useItems } from "@/features/items/useItems.js";

type ItemsViewProps = {
  repo: ItemRepository;
};

export function ItemsView({ repo }: ItemsViewProps) {
  const { items, error, add, remove } = useItems(repo);
  const [title, setTitle] = useState("");

  return (
    <section className="app-shell__panel">
      <h2>Example Item Flow</h2>
      <p>
        Replace this with the product&apos;s real first feature. It is here to prove the
        archetype wiring, not to prescribe business behavior.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void add(title);
          setTitle("");
        }}
      >
        <input
          aria-label="New item title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New item"
          value={title}
        />
        <button type="submit">Add</button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.title}</span>
            <button
              aria-label={`Remove ${item.title}`}
              onClick={() => void remove(item.id)}
              type="button"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
