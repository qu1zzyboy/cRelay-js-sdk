const fs = require('node:fs')
const esbuild = require('esbuild')
const glob = require('glob')

const entryPoints = glob.sync('**/*.ts', {
    ignore: [
      '**/*.test.ts',
      'core.ts',
      'test-helpers.ts',
      'helpers.ts',
      'benchmarks.ts',
      'lib/**',
      'node_modules/**'
    ]
  })

let common = {
  entryPoints,
  bundle: true,
  sourcemap: 'external',
}

esbuild
  .build({
    ...common,
    outdir: 'lib/esm',
    format: 'esm',
    packages: 'external',
  })
  .then(() => console.log('esm build success.'))

esbuild
  .build({
    ...common,
    outdir: 'lib/cjs',
    format: 'cjs',
    packages: 'external',
  })
  .then(() => {
    const packageJson = JSON.stringify({ type: 'commonjs' })
    fs.writeFileSync(`${__dirname}/lib/cjs/package.json`, packageJson, 'utf8')

    console.log('cjs build success.')
  })

esbuild
  .build({
    ...common,
    entryPoints: ['index.ts'],
    outfile: 'lib/nostr.bundle.js',
    format: 'iife',
    globalName: 'NostrTools',
    define: {
      window: 'self',
      global: 'self',
      process: '{"env": {}}',
    },
  })
  .then(() => console.log('standalone build success.'))
