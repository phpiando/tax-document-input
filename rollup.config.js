import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const banner = `/*!
 * Tax Document Input Plugin v2.0.0
 * Plugin JavaScript para formatação de documentos fiscais
 *
 * Copyright (c) 2025 Roni Sommerfeld
 * Released under the MIT License
 *
 * Date: ${new Date().toISOString().split('T')[0]}
 */`;

export default [
  // Build para desenvolvimento (não minificado)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/tax-document-input.js',
      format: 'umd',
      name: 'TaxDocumentInput',
      banner,
      exports: 'auto'
    },
    plugins: [
      nodeResolve()
    ]
  },

  // Build para produção (minificado)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/tax-document-input.min.js',
      format: 'umd',
      name: 'TaxDocumentInput',
      banner,
      exports: 'auto'
    },
    plugins: [
      nodeResolve(),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        format: {
          comments: /^!/
        }
      })
    ]
  },

  // Build para ES modules
  {
    input: 'src/index.js',
    output: {
      file: 'dist/tax-document-input.esm.js',
      format: 'es',
      banner
    },
    plugins: [
      nodeResolve()
    ]
  },

  // Build para CommonJS
  {
    input: 'src/index.js',
    output: {
      file: 'dist/tax-document-input.cjs.js',
      format: 'cjs',
      banner,
      exports: 'auto'
    },
    plugins: [
      nodeResolve()
    ]
  }
];