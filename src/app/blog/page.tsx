import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import { default as BlogOverviewView } from '@/views/Blog';
import posts from '@/lib/blog/posts';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and news about secure file sharing, password-protected links, and getting the most out of Passdropit.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog — Passdropit',
    description: 'Tips, guides, and news about secure file sharing, password-protected links, and getting the most out of Passdropit.',
    url: `${SITE_URL}/blog`,
  },
};

const BlogOverview = (): JSX.Element => {
  return (
    <MainLayout>
      <BlogOverviewView postList={posts} />
    </MainLayout>
  );
};

export default BlogOverview;
