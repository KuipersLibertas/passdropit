import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import { default as BlogOverviewView } from '@/views/Blog';
import { IPost } from '@/types';

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

const BlogOverview = async (): Promise<JSX.Element> => {
  let postList: IPost[] = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_GHOST_SITE_URL}/ghost/api/content/posts/?key=${process.env.NEXT_PUBLIC_GHOST_API_KEY}&include=tags,authors&filter=tag:Passdropit`,
      { method: 'GET', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
    const json = await response.json();
    postList = json.posts ?? [];
  } catch {
    // Ghost unavailable — render empty list
  }

  return (
    <MainLayout>
      <BlogOverviewView postList={postList} />
    </MainLayout>
  );
};

export default BlogOverview;
