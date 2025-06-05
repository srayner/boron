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
          className="inline-block bg-blue-500 text-primary-foreground text-sm leading-tight px-3 pt-[3px] pb-[5px] rounded-full mr-2 mb-4"
          style={{ lineHeight: 1 }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
