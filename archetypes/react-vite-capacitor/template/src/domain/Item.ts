export interface Item {
  id: string;
  title: string;
  createdAt: string;
}

export function validateItem(input: Pick<Item, "title">): string | null {
  if (!input.title.trim()) {
    return "Title is required.";
  }

  if (input.title.length > 200) {
    return "Title must be 200 characters or fewer.";
  }

  return null;
}
