import * as fs from 'fs';

const gifs = JSON.parse(fs.readFileSync('./.scratch/exercise_gifs.json', 'utf8'));
let code = fs.readFileSync('./src/catalog/exercises.ts', 'utf8');

for (const [id, url] of Object.entries(gifs)) {
  const pattern = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?instructions:\\s*['"][^'"]+['"],)`);
  if (pattern.test(code)) {
    code = code.replace(pattern, `$1\n    gifUrl: '${url}',`);
  } else {
    console.log('Could not match:', id);
  }
}

fs.writeFileSync('./src/catalog/exercises.ts', code);
console.log('Successfully added gifUrl to exercises.ts!');
