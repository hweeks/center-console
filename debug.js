const os = require('os');
const { execSync } = require('child_process');

const isWin = os.platform() === 'win32';
const properCommand = isWin ? 'yarn test:debug:win' : 'yarn test:debug:nix';
const extraArg = process.argv.slice(2);

execSync(`${properCommand} ${extraArg.join(' ')}`, {
  cwd: __dirname,
  stdio: 'inherit',
});
