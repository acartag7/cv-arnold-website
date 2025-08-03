# Assets

Static assets for the CV website.

## Structure

- **`images/`** - Image files (photos, icons, illustrations)
- **`fonts/`** - Custom font files (if not using web fonts)

## Usage

Assets are referenced using Next.js public directory:

```tsx
import Image from 'next/image'
;<Image
  src="/assets/images/profile.jpg"
  alt="Profile photo"
  width={200}
  height={200}
/>
```

## Conventions

- Images are optimized for web (WebP preferred)
- Use descriptive filenames with lowercase and hyphens
- Include multiple sizes for responsive images
- SVG icons are preferred for scalable graphics
