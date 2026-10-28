"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { api } from "@/app/lib/api";
import { blogCategories } from "@/app/lib/blog";
import { blogPostSchema, coverArts, type BlogPostInput } from "@/app/lib/schemas";
import type { BlogPostDetail } from "@/app/lib/types";
import { Button, ButtonLink } from "@/app/components/ui/button";
import { Field, Input, Select, Textarea } from "@/app/components/ui/field";
import { FacadeArt } from "@/app/components/site/facade-art";
import { RichText } from "@/app/components/site/rich-text";
import { Card, CardHeader, FillScroll, PageHeader } from "@/app/components/dashboard/ui";

const toSlug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

const emptyPost: BlogPostInput = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "Arquitectura",
  coverArt: "curtain",
  externalUrl: "",
  isPublished: false,
};

export function BlogPostForm({ post }: { post?: BlogPostDetail }) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: post
      ? {
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          content: post.content ?? "",
          category: post.category as BlogPostInput["category"],
          coverArt: post.coverArt,
          externalUrl: post.externalUrl ?? "",
          isPublished: post.isPublished,
        }
      : emptyPost,
  });

  const [title, content, coverArt, summary, category] = useWatch({ control, name: ["title", "content", "coverArt", "summary", "category"] });

  const titleField = register("title", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      // La URL se genera del título mientras nadie la haya editado a mano (y en artículos nuevos).
      if (!post && !dirtyFields.slug) setValue("slug", toSlug(event.target.value));
    },
  });

  const onSubmit = async (data: BlogPostInput) => {
    const payload = { ...data, slug: data.slug || null, externalUrl: data.externalUrl || null, content: data.content || null };
    try {
      const saved = await api<BlogPostDetail>(post ? `admin/blog/${post.id}` : "admin/blog", {
        method: post ? "PUT" : "POST",
        json: payload,
      });
      sileo.success({
        title: post ? "Artículo actualizado" : "Artículo creado",
        description: saved.isPublished ? "Ya está visible en el blog." : "Quedó como borrador.",
      });
      router.push("/dashboard/blog");
      router.refresh();
    } catch (error) {
      sileo.error({ title: "No se pudo guardar el artículo", description: (error as Error).message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={post ? "Editar artículo" : "Nuevo artículo"}
        description="Los artículos publicados aparecen en el blog del sitio web."
        actions={
          <>
            <ButtonLink href="/dashboard/blog" variant="outline">
              Cancelar
            </ButtonLink>
            <Button type="submit" variant="outline" loading={isSubmitting} onClick={() => setValue("isPublished", false)}>
              Guardar borrador
            </Button>
            <Button type="submit" loading={isSubmitting} onClick={() => setValue("isPublished", true)}>
              {getValues("isPublished") && post?.isPublished ? "Guardar y mantener publicado" : "Publicar"}
            </Button>
          </>
        }
      />

      <div className="grid flex-1 gap-6 xl:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader title="Contenido" />
          <div className="grid flex-1 gap-5 p-5 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto_auto_1fr]">
            <Field label="Título" htmlFor="title" error={errors.title?.message} className="sm:col-span-2">
              <Input id="title" error={errors.title?.message} {...titleField} />
            </Field>
            <Field label="URL del artículo" htmlFor="slug" error={errors.slug?.message} hint={`/blog/${getValues("slug") || "…"}`}>
              <Input id="slug" error={errors.slug?.message} {...register("slug")} />
            </Field>
            <Field label="Categoría" htmlFor="category" error={errors.category?.message}>
              <Select id="category" {...register("category")}>
                {blogCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Resumen" htmlFor="summary" error={errors.summary?.message} className="sm:col-span-2">
              <Textarea id="summary" className="min-h-20" error={errors.summary?.message} {...register("summary")} />
            </Field>
            <Field
              label="Enlace a la publicación original (opcional)"
              htmlFor="externalUrl"
              error={errors.externalUrl?.message}
              hint="Si lo indicas, el blog enlazará a esa página."
              className="sm:col-span-2"
            >
              <Input id="externalUrl" placeholder="https://" error={errors.externalUrl?.message} {...register("externalUrl")} />
            </Field>
            <Field
              label="Texto"
              htmlFor="content"
              error={errors.content?.message}
              hint='Separa párrafos con una línea en blanco. Usa "## " para subtítulos y "- " para listas.'
              className="flex flex-col sm:col-span-2"
            >
              <Textarea id="content" className="min-h-64 flex-1 font-mono text-[13px]" error={errors.content?.message} {...register("content")} />
            </Field>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Portada" />
            <div className="grid grid-cols-4 gap-3 p-5">
              {coverArts.map((art) => (
                <label key={art} className="cursor-pointer">
                  <input type="radio" value={art} className="peer sr-only" {...register("coverArt")} />
                  <span className="block aspect-[4/3] overflow-hidden rounded-xl ring-2 ring-transparent transition peer-checked:ring-ink-900 peer-focus-visible:ring-sky-400">
                    <FacadeArt variant={art} className="size-full" />
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="flex min-h-96 flex-1 flex-col overflow-hidden">
            <CardHeader title="Vista previa" />
            <FillScroll>
              <div className="relative aspect-[16/7] shrink-0 overflow-hidden bg-sky-100">
                <FacadeArt variant={coverArt} anchor="top" className="absolute inset-0 size-full" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{category}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{title || "Título del artículo"}</h2>
                <p className="mt-2 text-ink-500">{summary || "Resumen del artículo."}</p>
                <div className="mt-6 border-t border-ink-100 pt-6">
                  {content.trim() ? <RichText source={content} /> : <p className="text-sm text-ink-400">El texto aparecerá aquí.</p>}
                </div>
              </div>
            </FillScroll>
          </Card>
        </div>
      </div>
    </form>
  );
}
