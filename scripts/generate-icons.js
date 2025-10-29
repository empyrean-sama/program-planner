const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputSvg = path.join(__dirname, '../assets/icons/icon.svg');
const outputDir = path.join(__dirname, '../assets/icons');

async function generateIcons() {
  try {
    console.log('Converting SVG to PNG...');
    
    // Generate 512x512 PNG (for Linux and as base for other formats)
    await sharp(inputSvg)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon.png'));
    
    console.log('✓ Generated icon.png (512x512)');
    
    // Generate 256x256 PNG (for ICO)
    await sharp(inputSvg)
      .resize(256, 256)
      .png()
      .toFile(path.join(outputDir, 'icon-256.png'));
    
    console.log('✓ Generated icon-256.png (256x256)');
    
    // Generate other sizes for ICO
    await sharp(inputSvg)
      .resize(128, 128)
      .png()
      .toFile(path.join(outputDir, 'icon-128.png'));
    
    await sharp(inputSvg)
      .resize(64, 64)
      .png()
      .toFile(path.join(outputDir, 'icon-64.png'));
    
    await sharp(inputSvg)
      .resize(48, 48)
      .png()
      .toFile(path.join(outputDir, 'icon-48.png'));
    
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'icon-32.png'));
    
    await sharp(inputSvg)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'icon-16.png'));
    
    console.log('✓ Generated additional PNG sizes for ICO');
    
    console.log('\nAll PNG files generated successfully!');
    console.log('\nFor Windows (.ico) and macOS (.icns) icons:');
    console.log('1. Windows: Use an online converter like https://convertio.co/png-ico/');
    console.log('   - Upload the icon.png file');
    console.log('   - Convert to .ico format');
    console.log('   - Save as assets/icons/icon.ico');
    console.log('\n2. macOS: Use an online converter like https://cloudconvert.com/png-to-icns');
    console.log('   - Upload the icon.png file');
    console.log('   - Convert to .icns format');
    console.log('   - Save as assets/icons/icon.icns');
    console.log('\nAlternatively, if you have ImageMagick installed:');
    console.log('  magick convert icon.png icon.ico');
    console.log('\nOr for macOS with iconutil:');
    console.log('  Create icon.iconset folder with required sizes and run: iconutil -c icns icon.iconset');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
