const { default: pngToIco } = require('png-to-ico');
const path = require('path');
const fs = require('fs');

async function generateICO() {
  try {
    console.log('Generating Windows ICO file...');
    
    const iconDir = path.join(__dirname, '../assets/icons');
    
    // Use multiple sizes for the ICO file
    // Windows 11 taskbar uses up to 512x512 for high-DPI displays
    const pngFiles = [
      path.join(iconDir, 'icon-16.png'),
      path.join(iconDir, 'icon-32.png'),
      path.join(iconDir, 'icon-48.png'),
      path.join(iconDir, 'icon-64.png'),
      path.join(iconDir, 'icon-128.png'),
      path.join(iconDir, 'icon-256.png'),
      path.join(iconDir, 'icon-512.png'),
    ];
    
    const icoBuffer = await pngToIco(pngFiles);
    
    fs.writeFileSync(path.join(iconDir, 'icon.ico'), icoBuffer);
    
    console.log('✓ Generated icon.ico successfully!');
    console.log('\nWindows icon is ready at: assets/icons/icon.ico');
    
  } catch (error) {
    console.error('Error generating ICO:', error);
    process.exit(1);
  }
}

generateICO();
