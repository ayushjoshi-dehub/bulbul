import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    // Updated to target TypeScript and TSX files
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      
      // 1. Added strict, type-aware TypeScript configurations
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked, // Optional stylistic rules
      
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      
      // 2. Added advanced React ecosystem configurations
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { 
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
        // Fallback for files outside of the source tree
        extraFileExtensions: ['.js', '.jsx'],
      },
    },
  },
])