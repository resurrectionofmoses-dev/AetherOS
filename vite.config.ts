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
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          output: {
            manualChunks(id) {
              // ==========================================
              // SECTION 1: STRICT THIRD-PARTY NODE_MODULES SEPARATION
              // ==========================================
              if (id.includes('node_modules')) {
                // Core framework: React and scheduler runtime
                if (id.includes('react') || id.includes('scheduler')) {
                  return 'priority1-boot-react';
                }
                // Visual indicators: Lucide icons
                if (id.includes('lucide-react')) {
                  return 'priority2-ui-icons';
                }
                // Motion / Physics animations
                if (id.includes('framer-motion') || id.includes('motion')) {
                  return 'priority3-ui-motion';
                }
                // Data and analytical charts
                if (id.includes('recharts') || id.includes('d3')) {
                  return 'priority3-ui-charts';
                }
                // Database and authentications SDKs
                if (id.includes('firebase')) {
                  return 'priority4-sdk-firebase';
                }
                // Intelligent AI models SDK
                if (id.includes('@google/genai')) {
                  return 'priority4-sdk-genai';
                }
                // Fallback for general third-party dependencies
                return 'priority4-sdk-helpers';
              }

              // ==========================================
              // SECTION 2: INTERNAL FUNCTIONAL DOMAINS
              // ==========================================
              
              // DOMAIN A: CORE & BOOTSTRAPPING (Contexts, types, global utilities)
              if (
                id.includes('/contexts/') ||
                id.includes('firebaseAuthService') ||
                id.endsWith('/types.ts') ||
                id.endsWith('/agentTypes.ts') ||
                id.endsWith('/utils.ts') ||
                id.endsWith('/constants.tsx') ||
                id.endsWith('/eurodemux.tsx')
              ) {
                return 'priority1-boot-app';
              }

              // DOMAIN B: DEEP SERVICES (State machines, API managers, cryptographics)
              if (id.includes('/services/')) {
                return 'priority4-services-app';
              }

              // DOMAIN C: HIGH-LEVEL VIEWS & CONTROLLER ROUTERS
              if (
                id.endsWith('ViewRegistry.tsx') || 
                id.endsWith('/ViewRegistry.tsx')
              ) {
                return 'priority3-views-app';
              }

              // DOMAIN D: COMPONENT LEVEL COUPLING (Views & Low-level Reusable Elements)
              if (id.includes('/components/')) {
                const filename = id.split('/').pop() || '';
                
                // Group high-level view-controllers and heavy containers
                const isHighLevelView = /view|lab|dashboard|engine|network|simulator|system|audit|tracker|inspector|protocol|optimizer|bridge|gate|ledger|store|telemetry|scanner|halt|alarm|ecosystem|evo|warroom|board|showcase|playground|suite|deck|hub|center|vault|workshop|clinic|oracle|covenant/i.test(filename);
                
                if (isHighLevelView) {
                  return 'priority3-views-app';
                }
                
                // Group standard, low-level common UI elements
                return 'priority2-ui-common';
              }
            }
          }
        }
      }
    };
});
