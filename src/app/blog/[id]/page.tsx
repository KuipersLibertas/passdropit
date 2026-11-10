import React from 'react';
import MainLayout from '@/layouts/Main';
import { default as BlogDetailView } from '@/views/Blog/Detail';
import { notFound, redirect } from 'next/navigation';
import { IPost } from '@/types';
import { Metadata } from 'next';
import posts from '@/lib/blog/posts';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

function getPost(id: string): IPost | null {
  return posts.find((p) => p.slug === id) ?? null;
}

// Only the slugs in posts.ts exist; anything else is a real 404, not a soft 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ id: p.slug }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const post = getPost(params.id);
  if (!post) notFound();
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.custom_excerpt || '';
  const canonical = `${SITE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Passdropit`,
      description,
      images: post?.feature_image ? [post.feature_image] : undefined,
    },
    openGraph: {
      type: 'article',
      siteName: 'Passdropit',
      url: canonical,
      title: `${title} — Passdropit`,
      description,
      images: post?.feature_image ? [{ url: post.feature_image }] : undefined,
    },
  };
}

const BlogDetail = ({ params }: { params: { id: string } }): JSX.Element => {
  if (!params.id) redirect('/');
  const post = getPost(params.id);
  if (!post) notFound();
  const canonical = `${SITE_URL}/blog/${post.slug}`;

  const articleSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.custom_excerpt ?? '',
    url: canonical,
    image: post.feature_image ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? undefined,
    author: { '@type': 'Organization', name: 'Passdropit', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Passdropit', url: SITE_URL },
  } : null;

  return (
    <MainLayout>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {post && <BlogDetailView post={post} />}
    </MainLayout>
  );
};

export default BlogDetail;
