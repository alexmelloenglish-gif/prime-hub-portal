import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = process.cwd()

function candidatePaths(specifier, parentURL) {
  if (specifier.startsWith('@/')) {
    const base = path.join(root, specifier.slice(2))
    return [base, base + '.ts', base + '.mjs', base + '.json', path.join(base, 'index.ts')]
  }
  if (specifier.startsWith('.') && parentURL) {
    const parentPath = path.dirname(fileURLToPath(parentURL))
    const base = path.resolve(parentPath, specifier)
    return [base, base + '.ts', base + '.mjs', base + '.json', path.join(base, 'index.ts')]
  }
  return []
}

export async function resolve(specifier, context, defaultResolve) {
  try {
    return await defaultResolve(specifier, context, defaultResolve)
  } catch (error) {
    for (const candidate of candidatePaths(specifier, context.parentURL)) {
      if (existsSync(candidate)) {
        return {
          url: pathToFileURL(candidate).href,
          shortCircuit: true,
        }
      }
    }
    throw error
  }
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.json')) {
    const json = readFileSync(fileURLToPath(url), 'utf8')
    return {
      format: 'module',
      source: `export default ${json};\n`,
      shortCircuit: true,
    }
  }
  return defaultLoad(url, context, defaultLoad)
}
