const png2icons = require('png2icons');
const path = require('path');
const fs = require('fs');

async function generateICNS() {
  try {
    console.log('Generating macOS ICNS file...');
    
    const iconDir = path.join(__dirname, '../assets/icons');
    const pngFile = path.join(iconDir, 'icon.png');
    
    // Read the PNG file
    const pngBuffer = fs.readFileSync(pngFile);
    
    // Convert to ICNS
    const icnsBuffer = await png2icons.createICNS(pngBuffer, png2icons.BIGSUR, 0);
    
    // Save the ICNS file
    fs.writeFileSync(path.join(iconDir, 'icon.icns'), icnsBuffer);
    
    console.log('✓ Generated icon.icns successfully!');
    console.log('\nmacOS icon is ready at: assets/icons/icon.icns');
    console.log('\nAll platform-specific icon files are now ready:');
    console.log('  - assets/icons/icon.png  (Linux/General)');
    console.log('  - assets/icons/icon.ico  (Windows)');
    console.log('  - assets/icons/icon.icns (macOS)');
    
  } catch (error) {
    console.error('Error generating ICNS:', error);
    process.exit(1);
  }
}

generateICNS();
