export function parseQueryParams(req: Request) {
  const url = new URL(req.url);

  const search = url.searchParams.get("search") || "";
  const orderBy = url.searchParams.get("orderBy") || "createdAt";
  const orderDir = url.searchParams.get("orderDir") === "desc" ? "desc" : "asc";
  const take = parseInt(url.searchParams.get("take") || "20");
  const skip = parseInt(url.searchParams.get("skip") || "0");

  return {
    search,
    pagination: { take, skip },
    ordering: { [orderBy]: orderDir } as Record<string, "asc" | "desc">,
  };
}
