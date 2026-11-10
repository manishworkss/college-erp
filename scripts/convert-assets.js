const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertAssets() {
  const assetsLogoDir = path.join(__dirname, '../public/assets/logo');
  const assetsErpDir = path.join(__dirname, '../public/assets/erp-panel');

  fs.mkdirSync(assetsLogoDir, { recursive: true });
  fs.mkdirSync(assetsErpDir, { recursive: true });

  console.log('Created directories:');
  console.log(' -', assetsLogoDir);
  console.log(' -', assetsErpDir);

  // 1. Convert Logo
  const logoSource = path.join(__dirname, '../download.avif');
  const logoTarget = path.join(assetsLogoDir, 'mkr-dr-grd-college-logo.webp');
  
  await sharp(logoSource)
    .webp({ quality: 100, effort: 6 })
    .toFile(logoTarget);
  console.log('Converted Logo ->', logoTarget);

  // Also write standard alias for fast lookup
  await sharp(logoSource)
    .webp({ quality: 100, effort: 6 })
    .toFile(path.join(assetsLogoDir, 'mkr-college-emblem.webp'));

  // 2. Convert the 2 Official ERP Showcase Images (660x555)
  const erpImages = [
    {
      src: path.join(assetsErpDir, 'image-1.jpg'),
      dest: 'mkr-college-sitamarhi-main-campus-building.webp',
      alt: 'M.K.R. Dr. G.R.D. College Main Campus Building, Punaura Dham, Sitamarhi',
    },
    {
      src: path.join(assetsErpDir, 'image-2.jpg'),
      dest: 'mkr-college-leadership-award-ceremony.webp',
      alt: 'M.K.R. Dr. G.R.D. College Institutional Leadership Award Ceremony',
    }
  ];

  for (const img of erpImages) {
    if (fs.existsSync(img.src)) {
      const destPath = path.join(assetsErpDir, img.dest);
      await sharp(img.src)
        .resize(660, 555, { fit: 'cover', position: 'center' })
        .sharpen()
        .webp({ quality: 98, effort: 6 })
        .toFile(destPath);
      console.log(`Converted [${path.basename(img.src)}] -> [${img.dest}]`);
    }
  }

  console.log('\nAll assets converted successfully to WebP with high resolution!');
}

convertAssets().catch((err) => {
  console.error('Conversion failed:', err);
  process.exit(1);
});

