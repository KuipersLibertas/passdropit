'use client';

import React from 'react';
import moment from 'moment';
import CommonLayout from '@/views/shared/layouts/CommonLayout';
import AdSlot from '@/components/AdSlot';
import InArticleAdSlot from '@/components/InArticleAdSlot';

import {
  Box,
  Divider,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { IPost } from '@/types';


const BlogDetail = ({ post }: { post: IPost }): JSX.Element => {

  return (
    <CommonLayout title={post?.title}>
      {/* Side rail ads */}
      <AdSlot tagId="4218" slotId="blog-detail-left" style={{ position: 'fixed', left: 0, top: 70 }} />
      <AdSlot tagId="4219" slotId="blog-detail-right" style={{ position: 'fixed', right: 0, top: 70 }} />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{ width: 50, height: 50, marginRight: 2 }}
          />
          <Box>
            <Typography fontWeight={600}>{post?.primary_author.name}</Typography>
            <Typography color="text.secondary">{moment(post?.created_at).format('DD-MM-YYYY')}</Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <Typography color="text.secondary">Share:</Typography>
          <Box marginLeft={0.5}>            
            <IconButton
              aria-label="Twitter"
              href={`https://twitter.com/intent/tweet?text=${post.title}&url=${process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL}/blog/${post.slug}`}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              aria-label="Email"
              href={`mailto:?subject=${post.title}&body=${process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL}/blog/${post.slug}`}
            >
              <EmailIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Box paddingY={4}>
        <Divider />
      </Box>

      {/* In-article ad above post body — variant 1 (immediate, pre-defined by Setupad wrapper) */}
      <Box sx={{ my: 2 }}>
        <InArticleAdSlot variant={1} />
      </Box>

      <Box
        sx={{
          maxWidth: '1200px',
          'h2, h1, h3 ': {
            mt: '20px',
            mb: '10px',
            fontWeight: 500,
          },
          '> ul, > ol': {
            pl: '30px',
            mb: '10px'
          },
          '> p': {
            mb: '10px'
          },
          'table': {
            my: '10px',
            borderSpacing: '15px'
          },
          'img': {
            my: '10px',
            width: 1,
            height: 'auto'
          },
          'a': {
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 500,
          }
        }}
        dangerouslySetInnerHTML={{ __html: post?.html }}
      />

      {/* In-article ad below post body — variant 2 (lazy, defined inline on viewport entry) */}
      <Box sx={{ mt: 4 }}>
        <InArticleAdSlot variant={2} />
      </Box>
    </CommonLayout>
  );
};

export default BlogDetail;