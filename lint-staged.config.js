module.exports = {
  '**/*.ts': [
    () => 'npx tsc --skipLibCheck --noEmit',
    'npx eslint -c .eslintrc.js --fix',
    'git add',
  ],
}
