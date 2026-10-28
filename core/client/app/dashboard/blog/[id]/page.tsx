"use client";

import { use } from "react";
import { useApi } from "@/app/lib/use-api";
import type { BlogPostDetail } from "@/app/lib/types";
import { BlogPostForm } from "@/app/components/dashboard/blog-post-form";
import { ErrorState, Loading } from "@/app/components/dashboard/ui";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, reload } = useApi<BlogPostDetail>(`admin/blog/${Number(id)}`);

  if (loading && !data) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Artículo no encontrado"} onRetry={reload} />;
  return <BlogPostForm key={data.id} post={data} />;
}
