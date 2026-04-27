import React from 'react';
import MainLayout from '@/layouts/Main';
import { default as BlogDetailView } from '@/views/Blog/Detail';
import { redirect } from 'next/navigation';
import { IPost } from '@/types';
import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

async function getPost(id: string): Promise<IPost | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_GHOST_SITE_URL}/ghost/api/content/posts/slug/${id}/?key=${process.env.NEXT_PUBLIC_GHOST_API_KEY}&include=tags,authors`,
      { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
    const json = await response.json();
    if (!json.posts?.length) redirect('/');
    return json.posts[0];
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const ghostUrl = process.env.NEXT_PUBLIC_GHOST_SITE_URL;
  const ghostKey = process.env.NEXT_PUBLIC_GHOST_API_KEY;
  if (!ghostUrl || !ghostKey) return [];
  try {
    const res = await fetch(
      `${ghostUrl}/ghost/api/content/posts/?key=${ghostKey}&fields=slug&limit=all`
    );
    const json = await res.json();
    return (json.posts ?? []).map((p: { slug: string }) => ({ id: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id);
  const title = post?.title ? `${post.title}` : 'Blog';
  const description = post?.custom_excerpt ?? '';
  const canonical = `${SITE_URL}/blog/${post?.slug ?? params.id}`;

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

const BlogDetail = async ({ params }: { params: { id: string } }): Promise<JSX.Element> => {
  if (!params.id) redirect('/');
  const post = await getPost(params.id);
  const canonical = `${SITE_URL}/blog/${post?.slug ?? params.id}`;

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
