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

  // 2. Convert the 4 ERP Panel Showcase Images with SEO Names
  const erpImages = [
    {
      src: 'download-1.avif',
      dest: 'mkr-college-sitamarhi-main-campus-gate.webp',
      alt: 'M.K.R. Dr. G.R.D. College Sitamarhi Main Campus Gate & Entrance',
      title: 'College Main Campus Gate'
    },
    {
      src: 'download-2.avif',
      dest: 'mkr-dr-grd-college-academic-administrative-block.webp',
      alt: 'Academic and Administrative Block at MKR Dr GRD College Bihar',
      title: 'Academic & Administrative Block'
    },
    {
      src: 'download-3.avif',
      dest: 'mkr-college-punauradham-degree-infrastructure.webp',
      alt: 'Degree College Campus Infrastructure at Punaura Dham Sitamarhi',
      title: 'Degree College Campus Infrastructure'
    },
    {
      src: 'download4.avif',
      dest: 'mkr-college-student-central-learning-center.webp',
      alt: 'Central Learning & Student Facilities at MKR College BRABU Affiliated',
      title: 'Central Student Learning Facilities'
    }
  ];

  for (const img of erpImages) {
    const srcPath = path.join(__dirname, '..', img.src);
    const destPath = path.join(assetsErpDir, img.dest);

    await sharp(srcPath)
      .webp({ quality: 92, effort: 6 })
      .toFile(destPath);
    
    console.log(`Converted [${img.src}] -> [${img.dest}]`);
  }

  console.log('\nAll assets converted successfully to WebP with high resolution!');
}

convertAssets().catch((err) => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
