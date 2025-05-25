import React from "react";
import { Tag } from "@/types/entities";

type TagsListProps = {
  tags: Tag[];
};

export function TagsList({ tags }: TagsListProps) {
  return (
    <div>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-block bg-blue-500 text-primary-foreground text-sm px-3 pt-0.5 pb-1.5 rounded-full mr-2 mb-4"
          style={{ lineHeight: 1 }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
