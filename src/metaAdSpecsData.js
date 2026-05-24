export const META_AD_SPECS_SOURCES = [
  {
    format: 'Image',
    url: 'https://www.facebook.com/business/ads-guide/update/image',
  },
  {
    format: 'Video',
    url: 'https://www.facebook.com/business/ads-guide/update/video',
  },
  {
    format: 'Carousel',
    url: 'https://www.facebook.com/business/ads-guide/update/carousel',
  },
  {
    format: 'Collection',
    url: 'https://www.facebook.com/business/ads-guide/update/collection',
  },
]

export const META_FEED_COMPARISON_ROWS = [
  {
    spec: 'Placement',
    image: 'Facebook Feed',
    video: 'Facebook Feed',
    carousel: 'Facebook Feed',
    collection: 'Facebook Feed',
  },
  {
    spec: 'File type(s)',
    image: 'JPG, PNG',
    video: 'MP4, MOV, GIF',
    carousel: 'JPG, PNG (image cards); MP4, MOV, GIF (video cards)',
    collection: 'JPG, PNG (image); MP4, MOV, GIF (video cover)',
  },
  {
    spec: 'Aspect ratio',
    image: '1.91:1 to 4:5',
    video: '1:1 (desktop & mobile); 4:5 (mobile only)',
    carousel: '1:1 or 4:5',
    collection: '1:1 or 9:16 (cover from Instant Experience)',
  },
  {
    spec: 'Recommended resolution',
    image: '1:1 — 1440×1440 px; 4:5 — 1440×1800 px',
    video: '1:1 — 1440×1440 px; 4:5 — 1440×1800 px',
    carousel: 'At least 1080×1080 px',
    collection: 'At least 1080×1080 px',
  },
  {
    spec: 'Primary text',
    image: '50–150 characters (recommended)',
    video: '50–150 characters (recommended)',
    carousel: '80 characters',
    collection: '125 characters',
  },
  {
    spec: 'Headline',
    image: '27 characters',
    video: '27 characters',
    carousel: '45 characters',
    collection: '40 characters',
  },
  {
    spec: 'Description',
    image: '—',
    video: '—',
    carousel: '18 characters',
    collection: '—',
  },
  {
    spec: 'Landing page URL',
    image: '—',
    video: '—',
    carousel: 'Required',
    collection: 'Required',
  },
  {
    spec: 'Maximum file size',
    image: '30 MB',
    video: '4 GB',
    carousel: '30 MB (image); 4 GB (video)',
    collection: '30 MB (image); 4 GB (video)',
  },
  {
    spec: 'Minimum dimensions',
    image: '600 px width; 600 px height (1:1) or 750 px height (4:5)',
    video: '120×120 px',
    carousel: '—',
    collection: '—',
  },
  {
    spec: 'Video duration',
    image: '—',
    video: '1 second to 241 minutes',
    carousel: '1 second to 240 minutes (per card)',
    collection: '—',
  },
  {
    spec: 'Cards / assets',
    image: '—',
    video: '—',
    carousel: '2–10 carousel cards',
    collection: 'Cover + 3 product images; Instant Experience required',
  },
  {
    spec: 'Aspect ratio tolerance',
    image: '3%',
    video: '—',
    carousel: '—',
    collection: '—',
  },
  {
    spec: 'Video encoding (recommended)',
    image: '—',
    video: 'H.264, square pixels, fixed frame rate, progressive scan; stereo AAC 128 kbps+',
    carousel: '—',
    collection: '—',
  },
]

export const META_FEED_FORMAT_DETAILS = [
  {
    id: 'image',
    title: 'Image',
    sourceUrl: META_AD_SPECS_SOURCES[0].url,
    sections: [
      {
        title: 'Design recommendations',
        rows: [
          { label: 'File type', value: 'JPG or PNG' },
          { label: 'Ratio', value: '1.91:1 to 4:5' },
          {
            label: 'Resolution',
            value: '1:1 ratio — 1440×1440 px; 4:5 ratio — 1440×1800 px',
          },
        ],
      },
      {
        title: 'Text recommendations',
        rows: [
          { label: 'Primary text', value: '50–150 characters' },
          { label: 'Headline', value: '27 characters' },
        ],
      },
      {
        title: 'Technical requirements',
        rows: [
          { label: 'Maximum file size', value: '30 MB' },
          { label: 'Minimum width', value: '600 px' },
          {
            label: 'Minimum height',
            value: '600 px (1:1 ratio) or 750 px (4:5 ratio)',
          },
          { label: 'Aspect ratio tolerance', value: '3%' },
        ],
      },
    ],
  },
  {
    id: 'video',
    title: 'Video',
    sourceUrl: META_AD_SPECS_SOURCES[1].url,
    sections: [
      {
        title: 'Design recommendations',
        rows: [
          { label: 'File type', value: 'MP4, MOV or GIF' },
          {
            label: 'Ratio',
            value: '1:1 (desktop or mobile); 4:5 (mobile only)',
          },
          {
            label: 'Video settings',
            value:
              'H.264 compression, square pixels, fixed frame rate, progressive scan; stereo AAC audio at 128 kbps+',
          },
          {
            label: 'Resolution',
            value: '1:1 — 1440×1440 px; 4:5 — 1440×1800 px',
          },
          { label: 'Video captions', value: 'Optional, recommended' },
          { label: 'Video sound', value: 'Optional, recommended' },
        ],
      },
      {
        title: 'Text recommendations',
        rows: [
          { label: 'Primary text', value: '50–150 characters' },
          { label: 'Headline', value: '27 characters' },
        ],
      },
      {
        title: 'Technical requirements',
        rows: [
          { label: 'Video duration', value: '1 second to 241 minutes' },
          { label: 'Maximum file size', value: '4 GB' },
          { label: 'Minimum width', value: '120 px' },
          { label: 'Minimum height', value: '120 px' },
        ],
      },
      {
        title: 'Notes',
        rows: [
          {
            label: 'Awareness objectives',
            value:
              'For some Awareness goals on mobile Facebook Feed, the ad footer (headline, description, CTA, website URL) may not display.',
          },
        ],
      },
    ],
  },
  {
    id: 'carousel',
    title: 'Carousel',
    sourceUrl: META_AD_SPECS_SOURCES[2].url,
    sections: [
      {
        title: 'Design recommendations',
        rows: [
          { label: 'Image file type', value: 'JPG or PNG' },
          { label: 'Video file type', value: 'MP4, MOV or GIF' },
          { label: 'Ratio', value: '1:1 or 4:5' },
          { label: 'Resolution', value: 'At least 1080×1080 px' },
        ],
      },
      {
        title: 'Text recommendations',
        rows: [
          { label: 'Primary text', value: '80 characters' },
          { label: 'Headline', value: '45 characters' },
          { label: 'Description', value: '18 characters' },
          { label: 'Landing page URL', value: 'Required' },
        ],
      },
      {
        title: 'Technical requirements',
        rows: [
          { label: 'Number of carousel cards', value: '2 to 10' },
          { label: 'Image maximum file size', value: '30 MB' },
          { label: 'Video maximum file size', value: '4 GB' },
          { label: 'Video duration', value: '1 second to 240 minutes' },
        ],
      },
    ],
  },
  {
    id: 'collection',
    title: 'Collection',
    sourceUrl: META_AD_SPECS_SOURCES[3].url,
    sections: [
      {
        title: 'Design recommendations',
        rows: [
          {
            label: 'Cover media',
            value:
              'Cover image or video uses the first media asset from your Instant Experience',
          },
          { label: 'Image file type', value: 'JPG or PNG' },
          { label: 'Video file type', value: 'MP4, MOV or GIF' },
          { label: 'Ratio', value: '1:1 or 9:16' },
          { label: 'Resolution', value: 'At least 1080×1080 px' },
        ],
      },
      {
        title: 'Text recommendations',
        rows: [
          { label: 'Primary text', value: '125 characters' },
          { label: 'Headline', value: '40 characters' },
          { label: 'Landing page URL', value: 'Required' },
        ],
      },
      {
        title: 'Technical requirements',
        rows: [
          { label: 'Instant Experience', value: 'Required' },
          { label: 'Image maximum file size', value: '30 MB' },
          { label: 'Video maximum file size', value: '4 GB' },
        ],
      },
    ],
  },
]
