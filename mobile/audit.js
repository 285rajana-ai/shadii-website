const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
      filelist.push(filepath);
    }
  }
  return filelist;
};

const files = walkSync('/Users/mac/my-apps/shadi-pk/mobile/src');
const issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative('/Users/mac/my-apps/shadi-pk/mobile/src', file);
  
  // Find non-grid spacings (not a multiple of 4)
  const spacingRegex = /(?:margin|padding)(?:Top|Bottom|Left|Right|Horizontal|Vertical)?:\s*(\d+)/g;
  let match;
  while ((match = spacingRegex.exec(content)) !== null) {
    const val = parseInt(match[1], 10);
    if (val !== 0 && val % 4 !== 0 && val !== 1 && val !== 2) { // Allow 1 or 2 for borders/small tweaks
      issues.push({ type: 'spacing', file: relPath, val, match: match[0] });
    }
  }

  // Find random font sizes
  const fontRegex = /fontSize:\s*(\d+)/g;
  while ((match = fontRegex.exec(content)) !== null) {
    const val = parseInt(match[1], 10);
    if (![11, 12, 14, 16, 20, 24, 32, 40].includes(val)) {
      issues.push({ type: 'typography', file: relPath, val, match: match[0] });
    }
  }

  // Touch targets missing padding/size
  if (content.includes('<TouchableOpacity') && !content.includes('44')) {
    // just a rough heuristic
    // issues.push({ type: 'touch_target', file: relPath });
  }
});

console.log(JSON.stringify(issues, null, 2));
