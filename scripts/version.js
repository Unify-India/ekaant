const fs = require('fs');
const { Project } = require('@capacitor/project');

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const newVersion = packageJson.version;

console.log(`🚀 Bumping version to ${newVersion}`);

async function updateCapacitorConfig() {
  const proj = new Project();
  await proj.load();

  const [major, minor, patch] = newVersion.split('.').map(Number);
  const buildNumber = major * 10000 + minor * 100 + patch;

  proj.config.app.appVersion = newVersion;
  proj.config.app.appBuild = buildNumber.toString();

  await proj.commit();

  console.log(`✅ Updated capacitor.config.ts:`);
  console.log(`   appVersion: ${newVersion}`);
  console.log(`   appBuild: ${buildNumber}`);
}

updateCapacitorConfig();
