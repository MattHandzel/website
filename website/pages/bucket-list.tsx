import React from 'react';
import Navigation from '../components/Navigation';
import BucketListRenderer, { BucketListItem } from '../components/BucketListRenderer';
import contentData from '../data/content.json';
import { GetStaticProps } from 'next';

// Helper function to parse bucket list items
const parseBucketList = (content: string): BucketListItem[] => {
  const items: BucketListItem[] = [];
  const sections = content.split('---').map(s => s.trim()).filter(s => s.length > 0);

  for (const section of sections) {
    const lines = section.split('\n').map(line => line.trim());
    const description = lines.find(line => line.startsWith('**') && line.endsWith('**'))?.replace(/\*\*/g, '') || '';

    if (!description) continue;

    const data: Partial<BucketListItem> = { description, media: [] };

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (!key || !value) return;

      const formattedKey = key.trim().toLowerCase().replace(/ /g, '_') as keyof BucketListItem;

      if (formattedKey === 'media') {
        try {
          const mediaLinks = JSON.parse(value.replace(/'/g, '"'));
          data.media = Array.isArray(mediaLinks) ? mediaLinks : [];
        } catch (e) { data.media = []; }
      } else if (['status', 'motivation', 'type', 'completed', 'completed_on'].includes(String(formattedKey))) {
        data[formattedKey] = value.replace(/"/g, '');
      }
    });
    items.push(data as BucketListItem);
  }
  return items;
};

interface Content {
  id: string;
  title: string;
  type: string;
  content: string;
}

interface BucketListPageProps {
  sortedItems: BucketListItem[];
  introContent: string;
}

const BucketListPage: React.FC<BucketListPageProps> = ({ sortedItems, introContent }) => {
  return (
    <div>
      <Navigation currentPage="bucket-list" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-text mb-4">Bucket List</h1>
        {introContent && <p className="text-lg text-text/80 mb-8">{introContent}</p>}
        {sortedItems.length > 0 ? (
          <BucketListRenderer items={sortedItems} />
        ) : (
          <p>Bucket list content not found.</p>
        )}
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const allContent: Content[] = contentData as Content[];
  const bucketListItemData = allContent.find(item => item.id === 'bucket-list');
  
  let intro = '';
  let items: BucketListItem[] = [];

  if (bucketListItemData) {
    const contentParts = bucketListItemData.content.split('## Bucket List');
    if (contentParts.length > 1) {
        intro = contentParts[0].replace('# Bucket List', '').trim();
        items = parseBucketList(contentParts[1].trim());
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    if (a.completed === 'yes' && b.completed !== 'yes') return -1;
    if (a.completed !== 'yes' && b.completed === 'yes') return 1;

    if (a.completed === 'yes' && b.completed === 'yes') {
      return new Date(b.completed_on).getTime() - new Date(a.completed_on).getTime();
    }

    const statusOrder: { [key: string]: number } = { 'in progress': 1, 'planned': 2, 'not yet': 3, 'don\'t want it anymore': 4 };
    return (statusOrder[a.status.toLowerCase()] || 5) - (statusOrder[b.status.toLowerCase()] || 5);
  });

  return {
    props: {
      sortedItems,
      introContent: intro,
    },
  };
};

export default BucketListPage;
