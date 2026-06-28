import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                  return 'vendor-react';
                }
                if (id.includes('framer-motion') || id.includes('motion')) {
                  return 'vendor-motion';
                }
                if (id.includes('lucide-react')) {
                  return 'vendor-icons';
                }
                if (id.includes('d3')) {
                  return 'vendor-d3';
                }
                if (id.includes('recharts')) {
                  return 'vendor-recharts';
                }
                if (id.includes('ethers')) {
                  return 'vendor-ethers';
                }
                if (id.includes('firebase')) {
                  return 'vendor-firebase';
                }
                if (id.includes('@google/genai')) {
                  return 'vendor-genai';
                }
                return 'vendor-utils';
              }

              // Aggressive splitting for internal components/ and utility modules
              if (id.includes('/components/')) {
                const parts = id.split('/components/');
                const relativePath = parts[parts.length - 1];
                
                // If it is inside the icons subfolder
                if (relativePath.startsWith('icons/')) {
                  return 'components-icons';
                }

                // Isolate particularly heavy/large components
                if (relativePath.includes('CodingNetworkView')) {
                  return 'components-coding-network';
                }
                if (relativePath.includes('ProjectShowcaseView')) {
                  return 'components-project-showcase';
                }
                if (relativePath.includes('GoogleSheetsView')) {
                  return 'components-google-sheets';
                }

                // Group all the virtual/spec/simulation Lab views together
                if (relativePath.includes('LabView') || relativePath.includes('Lab.')) {
                  return 'components-labs';
                }

                // Alphabetical grouping for the remaining components
                const filename = relativePath.split('/').pop() || '';
                const firstChar = filename.charAt(0).toLowerCase();
                
                if (/[a-c]/.test(firstChar)) {
                  return 'components-a-c';
                }
                if (/[d-g]/.test(firstChar)) {
                  return 'components-d-g';
                }
                if (/[h-l]/.test(firstChar)) {
                  return 'components-h-l';
                }
                if (/[m-p]/.test(firstChar)) {
                  return 'components-m-p';
                }
                if (/[q-t]/.test(firstChar)) {
                  return 'components-q-t';
                }
                if (/[u-z]/.test(firstChar)) {
                  return 'components-u-z';
                }
                
                return 'components-misc';
              }

              // Splitting internal utility/service modules
              if (id.includes('/services/')) {
                const parts = id.split('/services/');
                const relativePath = parts[parts.length - 1];

                if (relativePath.includes('geminiService')) {
                  return 'services-gemini';
                }

                const filename = relativePath.split('/').pop() || '';
                const firstChar = filename.charAt(0).toLowerCase();

                if (/[a-g]/.test(firstChar)) {
                  return 'services-a-g';
                }
                return 'services-h-z';
              }

              if (id.includes('/contexts/')) {
                return 'app-contexts';
              }

              if (id.includes('/utils.ts')) {
                return 'app-utils';
              }

              if (id.includes('/types.ts') || id.includes('/agentTypes.ts')) {
                return 'app-types';
              }

              if (id.includes('/constants.tsx')) {
                return 'app-constants';
              }

              if (id.includes('/eurodemux.tsx')) {
                return 'app-eurodemux';
              }
            }
          }
        }
      }
    };
});
