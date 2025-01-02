import fs from 'fs/promises';
import path from 'path';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

async function generateTypes() {
  console.log('Starting icon type generation...');
  console.log('Icons directory:', ICONS_DIR);

  const styles = ['line', 'filled', 'color'];
  let typeContent = `// Auto-generated file - DO NOT EDIT DIRECTLY
export type IconStyle = 'line' | 'filled' | 'color';

`;

  for (const style of styles) {
    const styleDir = path.join(ICONS_DIR, style);
    console.log(`Processing ${style} directory:`, styleDir);
    
    try {
      const files = await fs.readdir(styleDir);
      console.log(`Found ${files.length} files in ${style}:`, files);
      
      const iconNames = files
        .filter(file => file.endsWith('.svg'))
        .map(file => path.basename(file, '.svg'));
      
      console.log(`Found ${iconNames.length} SVG icons in ${style}:`, iconNames);

      const typeName = `${style.charAt(0).toUpperCase()}${style.slice(1)}IconName`;
      typeContent += `export type ${typeName} = \n`;
      typeContent += iconNames.map(name => `  | '${name}'`).join('\n');
      typeContent += ';\n\n';
    } catch (error) {
      console.error(`Error processing ${style} directory:`, error);
    }
  }

  typeContent += `export type IconNameMap = {
  line: LineIconName;
  filled: FilledIconName;
  color: ColorIconName;
};\n`;

  const typesDir = path.join(process.cwd(), 'src', 'types');
  const outputPath = path.join(typesDir, 'icons.ts');
  
  try {
    await fs.mkdir(typesDir, { recursive: true });
    await fs.writeFile(outputPath, typeContent);
    console.log('Icon types written successfully to:', outputPath);
    console.log('Generated content:', typeContent);
  } catch (error) {
    console.error('Error writing types file:', error);
  }
}

generateTypes().catch(console.error);