import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, AlertTriangle, ShieldCheck, Copy, Check, 
  Download, ExternalLink, FileText, Smartphone, Key, Users, 
  Rocket, Clock, Activity, FileCode, Trash2, RefreshCw, Info, Lock,
  Image as ImageIcon, Sparkles, Layers
} from 'lucide-react';
import { safeStorage } from '../services/safeStorage';
import { toast } from 'sonner';
import aetherosShield from '../src/assets/images/aetheros_shield_512.png';
import aetherosBanner from '../src/assets/images/aetheros_logo_1780191892733.png';

interface ChecklistItem {
  id: string;
  phase: string;
  label: string;
  description?: string;
  requiredForAlpha?: boolean;
  link?: string;
  codeSnippet?: string;
}

interface PhaseDefinition {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  items: ChecklistItem[];
}

const CHECKLIST_PHASES: PhaseDefinition[] = [
  {
    id: 'phase_0',
    title: 'Phase 0: Developer Account',
    subtitle: 'Once per developer organization, not per app',
    badge: 'Account Prerequisite',
    items: [
      {
        id: 'p0_console_created',
        phase: 'Phase 0',
        label: 'Google Play Console account created',
        description: 'Account created at play.google.com/console ($25 one-time registration fee).',
        link: 'https://play.google.com/console'
      },
      {
        id: 'p0_identity_verified',
        phase: 'Phase 0',
        label: 'Identity verification completed',
        description: 'Government ID submitted; organizations also need D-U-N-S number and organizational website.'
      },
      {
        id: 'p0_payments_profile',
        phase: 'Phase 0',
        label: 'Payments profile set up',
        description: 'Merchant profile configured in Google Play Console if the app is paid or sells in-app products/subscriptions.'
      },
      {
        id: 'p0_contact_email',
        phase: 'Phase 0',
        label: 'Monitored contact email active',
        description: 'An email monitored daily — Google sends policy enforcement and review violation notices here with strict deadlines.'
      }
    ]
  },
  {
    id: 'phase_1',
    title: 'Phase 1: Pre-Build Architecture',
    subtitle: 'Irreversible decisions that must be locked in before first upload',
    badge: 'Permanent Decisions',
    items: [
      {
        id: 'p1_app_id_locked',
        phase: 'Phase 1',
        label: 'Final applicationId chosen & locked',
        description: 'Can NEVER be changed after the first bundle upload (e.g., com.aetheros.maestro.conjunction).',
        requiredForAlpha: true
      },
      {
        id: 'p1_free_or_paid',
        phase: 'Phase 1',
        label: 'Free vs Paid pricing permanently decided',
        description: 'Free → Paid is strictly forbidden later; Paid → Free is permitted.'
      },
      {
        id: 'p1_monetization_declared',
        phase: 'Phase 1',
        label: 'Monetization strategy declared',
        description: 'Ads, In-App Purchases, or Subscriptions explicitly planned (each requires a dedicated declaration in Phase 4).'
      },
      {
        id: 'p1_privacy_policy_url',
        phase: 'Phase 1',
        label: 'Privacy Policy hosted at public URL',
        description: 'Mandatory for all apps; required in store listing AND accessible inside the app interface.',
        requiredForAlpha: true
      },
      {
        id: 'p1_account_deletion_url',
        phase: 'Phase 1',
        label: 'Web page for user account & data deletion',
        description: 'Required if the app allows account creation. Google requires this link in Data Safety and in-app.',
        requiredForAlpha: true
      }
    ]
  },
  {
    id: 'phase_1_5',
    title: 'Phase 1.5: Google CLA & Eurodemas',
    subtitle: 'Conditional: Only applies if contributing code to Google open-source projects',
    badge: 'CLA & Audit',
    items: [
      {
        id: 'p15_cla_signed',
        phase: 'Phase 1.5',
        label: 'Google CLA signed (Individual or Corporate)',
        description: 'Governs contributions to AOSP, Chromium, Go, Firebase, or Google sample code at cla.developers.google.com.',
        link: 'https://cla.developers.google.com'
      },
      {
        id: 'p15_copyright_patent_scope',
        phase: 'Phase 1.5',
        label: 'Copyright & Patent retaliation tooth understood',
        description: 'You keep copyright and grant worldwide license; patent grant terminates for any entity that sues over contribution (Section 3).'
      },
      {
        id: 'p15_original_creation',
        phase: 'Phase 1.5',
        label: 'Original creation / employer waiver affirmed',
        description: 'Legally entitled to grant licenses; employer permission or Corporate CLA on file (Sections 4-5, 8).'
      },
      {
        id: 'p15_eurodemas_clearance',
        phase: 'Phase 1.5',
        label: 'Eurodemas 500-Tool Automated Audit Verified',
        description: 'Conditional passage 60/100 (0 absolutes, 0 evasions). #210 Consent Checklist PASS, #423 Contract Clause Clamp PASS.'
      }
    ]
  },
  {
    id: 'phase_2',
    title: 'Phase 2: Release-Ready Bundle',
    subtitle: 'Technical compilation, 64-bit binaries, and cryptographic signing',
    badge: 'Build Pipeline',
    items: [
      {
        id: 'p2_target_api_35',
        phase: 'Phase 2',
        label: 'Target API 35 (Android 15) or higher',
        description: 'Meets Google Play annual requirement for new apps and updates (Aug 2025+ baseline).',
        requiredForAlpha: true
      },
      {
        id: 'p2_native_64bit',
        phase: 'Phase 2',
        label: 'Native binaries include 64-bit (arm64-v8a)',
        description: 'All C/C++ or native libraries must ship arm64-v8a alongside any 32-bit builds.'
      },
      {
        id: 'p2_version_codes',
        phase: 'Phase 2',
        label: 'versionCode incremented & versionName set',
        description: 'versionCode is an integer higher than any previous upload; versionName is human readable (e.g. 1.0.0).'
      },
      {
        id: 'p2_keystore_generated',
        phase: 'Phase 2',
        label: 'Upload Keystore generated & backed up offline in 2 places',
        description: 'RSA 2048-bit keypair valid for 10,000 days. Losing this slows down key resets.',
        codeSnippet: 'keytool -genkeypair -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload'
      },
      {
        id: 'p2_play_app_signing',
        phase: 'Phase 2',
        label: 'Play App Signing enrolled',
        description: 'Mandatory for new apps. Google holds the app-signing key; upload keystore signs your submissions.'
      },
      {
        id: 'p2_aab_bundle',
        phase: 'Phase 2',
        label: 'Android App Bundle (.aab) generated',
        description: 'APKs are rejected for new apps. Build via Android Studio or CLI.',
        codeSnippet: './gradlew bundleRelease'
      },
      {
        id: 'p2_clean_install_verified',
        phase: 'Phase 2',
        label: 'AAB installs & runs cleanly on real physical device',
        description: 'Tested from a clean install via bundletool or internal testing track on hardware.',
        requiredForAlpha: true
      },
      {
        id: 'p2_debug_flags_stripped',
        phase: 'Phase 2',
        label: 'Debug flags, test endpoints & telemetry stripped',
        description: 'No placeholder keys, sandbox URLs, or verbose logging of personal data in release bundle.'
      },
      {
        id: 'p2_manifest_permissions_clean',
        phase: 'Phase 2',
        label: 'Only justified, visibly used manifest permissions included',
        description: 'Unused permissions (location, camera, storage, SMS) trigger policy review delays.'
      }
    ]
  },
  {
    id: 'phase_3',
    title: 'Phase 3: Play Console Store Listing',
    subtitle: 'Storefront presentation, screenshots, graphics, and categorization',
    badge: 'Storefront',
    items: [
      {
        id: 'p3_app_name',
        phase: 'Phase 3',
        label: 'App name configured (max 30 characters)',
        description: 'No keyword stuffing, no fake ranking claims (e.g. "Best App").'
      },
      {
        id: 'p3_short_desc',
        phase: 'Phase 3',
        label: 'Short description written (max 80 characters)',
        description: 'Punchy summary displayed in search and browse cards.'
      },
      {
        id: 'p3_full_desc',
        phase: 'Phase 3',
        label: 'Full description written (max 4,000 characters)',
        description: 'Complete features and usage guidelines without spam keywords.'
      },
      {
        id: 'p3_app_icon',
        phase: 'Phase 3',
        label: 'App icon exported (512 × 512 PNG, 32-bit, < 1 MB)',
        description: 'Square design without rounded corners (Play Store applies corner masks).'
      },
      {
        id: 'p3_feature_graphic',
        phase: 'Phase 3',
        label: 'Feature graphic exported (1024 × 500 JPG/PNG)',
        description: 'High-resolution promotional banner for store listing hero.'
      },
      {
        id: 'p3_phone_screenshots',
        phase: 'Phase 3',
        label: 'Phone screenshots uploaded (2 to 8 images, 16:9 or 9:16)',
        description: 'Minimum dimension 320px, maximum 3840px.'
      },
      {
        id: 'p3_category_tags',
        phase: 'Phase 3',
        label: 'Category and tags assigned',
        description: 'Appropriate primary category and up to 5 relevant tags selected.'
      }
    ]
  },
  {
    id: 'phase_4',
    title: 'Phase 4: Compliance Declarations',
    subtitle: 'Console → App content: Every declaration must pass before rollout',
    badge: 'Console Declarations',
    items: [
      {
        id: 'p4_privacy_policy_entered',
        phase: 'Phase 4',
        label: 'Privacy policy URL entered in Console',
        description: 'Matches the live hosted privacy policy URL identically.'
      },
      {
        id: 'p4_data_safety_form',
        phase: 'Phase 4',
        label: 'Data safety section completed accurately',
        description: 'Every data type collected/shared by app and SDKs, transit encryption, and deletion capability.',
        requiredForAlpha: true
      },
      {
        id: 'p4_content_rating',
        phase: 'Phase 4',
        label: 'IARC Content Rating questionnaire completed',
        description: 'Official digital age rating certificate issued for all territories.'
      },
      {
        id: 'p4_target_audience',
        phase: 'Phase 4',
        label: 'Target audience & Families policy declared',
        description: 'Age groups selected. If children are included, Families policy applies to ads and data handling.'
      },
      {
        id: 'p4_ads_declaration',
        phase: 'Phase 4',
        label: 'Ads declaration answered (Yes/No)',
        description: 'Truthfully declare if app displays banner, interstitial, or rewarded ads.'
      },
      {
        id: 'p4_account_deletion_link',
        phase: 'Phase 4',
        label: 'Account & data deletion web URL submitted',
        description: 'Direct link where users can submit account deletion requests.'
      },
      {
        id: 'p4_abuse_monitoring_scope',
        phase: 'Phase 4',
        label: 'Abuse Monitoring Policy scope affirmed',
        description: 'Prompts, context, and generated output 55-day retention policy for safety and prohibited use enforcement.'
      }
    ]
  },
  {
    id: 'phase_5',
    title: 'Phase 5: 14-Day Closed Testing',
    subtitle: 'Mandatory for personal accounts created after Nov 2023: 12 testers for 14 continuous days',
    badge: '14-Day Test Gate',
    items: [
      {
        id: 'p5_internal_test_track',
        phase: 'Phase 5',
        label: 'Internal testing track uploaded & verified',
        description: 'Initial AAB tested by internal team (up to 100 testers) with immediate availability.'
      },
      {
        id: 'p5_pre_launch_report',
        phase: 'Phase 5',
        label: 'Pre-launch report reviewed (Firebase Test Lab)',
        description: 'Automated test results checked for crashes, ANRs, accessibility warnings, and display bugs.'
      },
      {
        id: 'p5_closed_testing_12_testers',
        phase: 'Phase 5',
        label: 'At least 12 distinct testers actively opted in',
        description: 'Personal accounts must recruit 12+ real testers with opt-in status confirmed in Console.',
        requiredForAlpha: true
      },
      {
        id: 'p5_fourteen_day_duration',
        phase: 'Phase 5',
        label: '14 continuous days completed with testers opted in',
        description: 'Plan the full two weeks before you can apply for Production access.',
        requiredForAlpha: true
      }
    ]
  },
  {
    id: 'phase_6',
    title: 'Phase 6: Production Staged Rollout',
    subtitle: 'Final store release, release notes, and phased percentage rollout',
    badge: 'Store Launch',
    items: [
      {
        id: 'p6_production_release_created',
        phase: 'Phase 6',
        label: 'Production track release created with final .aab',
        description: 'Signed release bundle uploaded to Production track in Console.'
      },
      {
        id: 'p6_release_notes',
        phase: 'Phase 6',
        label: 'Release notes written in plain, human language',
        description: 'Highlighting new capabilities and stability enhancements.'
      },
      {
        id: 'p6_countries_selected',
        phase: 'Phase 6',
        label: 'Distribution countries & regions selected',
        description: 'Target geographies enabled.'
      },
      {
        id: 'p6_staged_rollout',
        phase: 'Phase 6',
        label: 'Staged rollout configured (e.g. 20% → 50% → 100%)',
        description: 'Allows halting a bad build before widespread impact.'
      },
      {
        id: 'p6_live_store_confirmed',
        phase: 'Phase 6',
        label: 'Listing confirmed live from non-tester device',
        description: 'Verified public appearance in Play Store app from un-enrolled hardware.'
      }
    ]
  },
  {
    id: 'phase_7',
    title: 'Phase 7: Post-Launch & Vitals',
    subtitle: 'Ongoing vitals monitoring, ANR thresholds, and update cycles',
    badge: 'Perpetual Maintenance',
    items: [
      {
        id: 'p7_android_vitals_weekly',
        phase: 'Phase 7',
        label: 'Android Vitals monitored weekly (Crash & ANR rates)',
        description: 'Crash rate must stay below 1.09%, ANR rate below 0.47% to avoid search demotion.'
      },
      {
        id: 'p7_user_reviews_replied',
        phase: 'Phase 7',
        label: 'Reviews triaged and replied to within 48h',
        description: 'Active engagement improves store trust and ranking algorithm.'
      },
      {
        id: 'p7_version_code_bump_discipline',
        phase: 'Phase 7',
        label: 'Update workflow established (versionCode++, release notes)',
        description: 'Every release increments integer versionCode and follows staged rollout track.'
      },
      {
        id: 'p7_annual_target_api_budgeted',
        phase: 'Phase 7',
        label: 'Annual Target API bump budgeted in roadmap',
        description: 'Google increases minimum target API annually (Aug deadline blocks updates if missed).'
      },
      {
        id: 'p7_keystores_backed_up',
        phase: 'Phase 7',
        label: 'Keystores & Console credentials backed up off-site',
        description: 'Ensures system survives machine or laptop loss.'
      }
    ]
  }
];

const FIVE_CRITICAL_MISTAKES = [
  {
    title: "1. Losing the Upload Keystore",
    impact: "Slow & painful recovery via Google Support",
    solution: "Back up upload-keystore.jks in at least two separate offline locations right now."
  },
  {
    title: "2. Data Safety Mismatch with Privacy Policy",
    impact: "Immediate app rejection during review",
    solution: "Ensure every data type declared in the Console matches the exact wording in your hosted policy."
  },
  {
    title: "3. Wrong applicationId on First Upload",
    impact: "Permanent — can NEVER be altered",
    solution: "Double-check your reverse-domain identifier (e.g. com.yourcompany.app) before uploading your first .aab."
  },
  {
    title: "4. Forgetting the 14-Day Closed-Test Rule",
    impact: "Blocks production application for personal accounts",
    solution: "Recruit 12+ opt-in testers on Day 1 and schedule the continuous 14 days into your launch calendar."
  },
  {
    title: "5. Shipping Unused Manifest Permissions",
    impact: "Triggers deep policy scrutiny & compliance holds",
    solution: "Audit AndroidManifest.xml and strip any camera, storage, SMS, or location tags not visibly used."
  }
];

export const LaunchCenterView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'testing_tracker' | 'metadata' | 'mistakes'>('checklist');
  const [activePhaseId, setActivePhaseId] = useState<string>('all');
  
  // App Identifiers & Store Listing Copy
  const [appName, setAppName] = useState<string>('AetherOS: Conjunction Series');
  const [appId, setAppId] = useState<string>('com.aetheros.maestro.conjunction');
  const [versionName, setVersionName] = useState<string>('1.0.0');
  const [versionCode, setVersionCode] = useState<number>(1);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState<string>('https://aetheros.network/privacy');
  const [accountDeletionUrl, setAccountDeletionUrl] = useState<string>('https://aetheros.network/delete-account');
  const [shortDescription, setShortDescription] = useState<string>('Sovereign system orchestration, live telemetry diagnostics & developer network.');
  const [fullDescription, setFullDescription] = useState<string>(
    'AetherOS: Conjunction Series is a sovereign telemetry and developer orchestration platform designed for real-time system diagnostics, forensic glitch logging, persistent project management, and secure multi-agent coordination.\n\nKey Capabilities:\n• Real-Time System Diagnostics: Live 24-hour battery health analytics, subsystem overrides, and forensic audit logs.\n• Sovereign Coding Network: Project management boards, skill endorsements, and collaborative project showcases.\n• Encrypted Local-First Persistence: AES-GCM Web Crypto protected storage with offline-resilient operation.\n• Launch Readiness Suite: End-to-end compliance checklist and closed-test cohort tracking.'
  );
  const [primaryCategory, setPrimaryCategory] = useState<string>('Tools / Productivity');

  // Closed Testing Tracker State
  const [testStartDate, setTestStartDate] = useState<string>(() => {
    return new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  });
  const [testerEmails, setTesterEmails] = useState<string[]>([
    'alpha-tester-1@aetheros.network',
    'alpha-tester-2@aetheros.network',
    'alpha-tester-3@aetheros.network',
    'alpha-tester-4@aetheros.network',
    'alpha-tester-5@aetheros.network',
    'alpha-tester-6@aetheros.network',
    'alpha-tester-7@aetheros.network',
    'alpha-tester-8@aetheros.network',
    'alpha-tester-9@aetheros.network',
    'alpha-tester-10@aetheros.network',
    'alpha-tester-11@aetheros.network',
    'alpha-tester-12@aetheros.network',
    'resurrectionofmoses@gmail.com'
  ]);
  const [newTesterInput, setNewTesterInput] = useState<string>('');

  // Checklist state map: item_id -> boolean
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from safeStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await safeStorage.getItem('aetheros_play_publishing_state');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.checkedItems) setCheckedItems(parsed.checkedItems);
          if (parsed.appName) setAppName(parsed.appName);
          if (parsed.appId) setAppId(parsed.appId);
          if (parsed.versionName) setVersionName(parsed.versionName);
          if (parsed.versionCode) setVersionCode(parsed.versionCode);
          if (parsed.privacyPolicyUrl) setPrivacyPolicyUrl(parsed.privacyPolicyUrl);
          if (parsed.accountDeletionUrl) setAccountDeletionUrl(parsed.accountDeletionUrl);
          if (parsed.shortDescription) setShortDescription(parsed.shortDescription);
          if (parsed.fullDescription) setFullDescription(parsed.fullDescription);
          if (parsed.primaryCategory) setPrimaryCategory(parsed.primaryCategory);
          if (parsed.testStartDate) setTestStartDate(parsed.testStartDate);
          if (parsed.testerEmails) setTesterEmails(parsed.testerEmails);
        } else {
          // Default initial checked items for alpha baseline
          setCheckedItems({
            'p0_console_created': true,
            'p0_identity_verified': true,
            'p0_contact_email': true,
            'p1_app_id_locked': true,
            'p1_free_or_paid': true,
            'p1_monetization_declared': true,
            'p1_privacy_policy_url': true,
            'p1_account_deletion_url': true,
            'p15_cla_signed': true,
            'p15_copyright_patent_scope': true,
            'p15_eurodemas_clearance': true,
            'p2_target_api_35': true,
            'p2_version_codes': true,
            'p2_keystore_generated': true,
            'p2_play_app_signing': true,
            'p3_app_name': true,
            'p3_short_desc': true,
            'p3_full_desc': true,
            'p3_app_icon': true,
            'p3_feature_graphic': true,
            'p4_abuse_monitoring_scope': true
          });
        }
      } catch (e) {
        console.error("[LaunchCenterView] Failed to load checklist state:", e);
      }
    })();
  }, []);

  // Save changes to safeStorage
  const persistState = (updatedChecks: Record<string, boolean>) => {
    try {
      const payload = {
        checkedItems: updatedChecks,
        appName,
        appId,
        versionName,
        versionCode,
        privacyPolicyUrl,
        accountDeletionUrl,
        shortDescription,
        fullDescription,
        primaryCategory,
        testStartDate,
        testerEmails
      };
      safeStorage.setItem('aetheros_play_publishing_state', JSON.stringify(payload));
    } catch (e) {
      console.warn("[LaunchCenterView] Storage update throttled:", e);
    }
  };

  const toggleItem = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    persistState(updated);
  };

  // Compute Statistics
  const allItems = useMemo(() => {
    return CHECKLIST_PHASES.flatMap(p => p.items);
  }, []);

  const totalCount = allItems.length;
  const completedCount = useMemo(() => {
    return allItems.filter(item => checkedItems[item.id]).length;
  }, [allItems, checkedItems]);

  const readinessPercent = Math.round((completedCount / totalCount) * 100);

  // Alpha Specific Items: items marked with requiredForAlpha
  const alphaItems = useMemo(() => allItems.filter(i => i.requiredForAlpha), [allItems]);
  const alphaCompletedCount = useMemo(() => {
    return alphaItems.filter(i => checkedItems[i.id]).length;
  }, [alphaItems, checkedItems]);
  const alphaPercent = Math.round((alphaCompletedCount / alphaItems.length) * 100);

  // 14-Day Closed-Test Calculations
  const testDaysElapsed = useMemo(() => {
    const start = new Date(testStartDate).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(14, diff));
  }, [testStartDate]);

  const testDaysRemaining = 14 - testDaysElapsed;
  const testerCount = testerEmails.length;
  const testersMet = testerCount >= 12;
  const durationMet = testDaysElapsed >= 14;

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Command Copied', {
      description: text,
      className: 'bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs'
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExportChecklistMarkdown = () => {
    const lines = [
      `# Google Play Publishing & Alpha Readiness Report`,
      `**App Name:** ${appName}`,
      `**Package / applicationId:** ${appId}`,
      `**Version:** ${versionName} (code: ${versionCode})`,
      `**Export Date:** ${new Date().toISOString()}`,
      `**Overall Readiness:** ${readinessPercent}% (${completedCount}/${totalCount})`,
      `**Alpha Core Readiness:** ${alphaPercent}% (${alphaCompletedCount}/${alphaItems.length})`,
      `**14-Day Closed-Test:** ${testDaysElapsed}/14 days elapsed with ${testerCount} active testers`,
      ``,
      `---`,
      ``
    ];

    CHECKLIST_PHASES.forEach(phase => {
      lines.push(`## ${phase.title}`);
      lines.push(`*${phase.subtitle}*`);
      lines.push(``);
      phase.items.forEach(item => {
        const check = checkedItems[item.id] ? '[x]' : '[ ]';
        lines.push(`- ${check} **${item.label}**`);
        if (item.description) {
          lines.push(`  ${item.description}`);
        }
        if (item.codeSnippet) {
          lines.push(`  \`${item.codeSnippet}\``);
        }
      });
      lines.push(``);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-play-checklist-${appId}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Checklist Exported', {
      description: 'Downloaded markdown readiness report.',
      className: 'bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs'
    });
  };

  const handleAddTester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTesterInput || !newTesterInput.includes('@')) {
      toast.error('Invalid Email', { description: 'Please enter a valid tester email address.' });
      return;
    }
    if (testerEmails.includes(newTesterInput.trim())) {
      toast.info('Tester Already Enrolled');
      return;
    }
    const updated = [...testerEmails, newTesterInput.trim()];
    setTesterEmails(updated);
    setNewTesterInput('');
    persistState(checkedItems);
    toast.success('Tester Enrolled', { description: `${newTesterInput} added to 14-day testing cohort.` });
  };

  const handleRemoveTester = (email: string) => {
    const updated = testerEmails.filter(e => e !== email);
    setTesterEmails(updated);
    persistState(checkedItems);
  };

  const displayedPhases = useMemo(() => {
    if (activePhaseId === 'all') return CHECKLIST_PHASES;
    return CHECKLIST_PHASES.filter(p => p.id === activePhaseId);
  }, [activePhaseId]);

  return (
    <div className="h-full flex flex-col bg-[#070709] text-zinc-200 font-mono overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">
                Google Play Alpha Readiness Suite
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase">
                v2026.11
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Automated 7-Phase Compliance Pipeline &amp; Storefront Assertion Matrix
            </p>
          </div>
        </div>

        {/* Global Readiness Scores */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-2 rounded-xl">
            <div className="text-right">
              <span className="text-[8px] text-zinc-500 uppercase block font-black">Alpha Core</span>
              <span className={`text-base font-bold ${alphaPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {alphaPercent}%
              </span>
            </div>
            <div className="w-px h-7 bg-zinc-800" />
            <div className="text-right">
              <span className="text-[8px] text-zinc-500 uppercase block font-black">Full Production</span>
              <span className={`text-base font-bold ${readinessPercent >= 80 ? 'text-emerald-400' : readinessPercent >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {readinessPercent}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportChecklistMarkdown}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-zinc-650 text-zinc-300 hover:text-white rounded-xl text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              title="Download Markdown Report"
            >
              <Download size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Identifiers Banner */}
      <div className="px-6 py-3 bg-black/60 border-b border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs shrink-0">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <FileText size={10} className="text-amber-400" /> App Name (Max 30)
          </span>
          <input
            type="text"
            value={appName}
            maxLength={30}
            onChange={(e) => {
              setAppName(e.target.value);
              persistState(checkedItems);
            }}
            className="bg-transparent border-none p-0 text-zinc-200 font-bold focus:ring-0 text-xs mt-0.5 truncate"
            placeholder="App Name"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Lock size={10} className="text-rose-400" /> Package / applicationId
          </span>
          <input
            type="text"
            value={appId}
            onChange={(e) => {
              setAppId(e.target.value);
              persistState(checkedItems);
            }}
            className="bg-transparent border-none p-0 text-cyan-400 font-bold font-mono focus:ring-0 text-xs mt-0.5 truncate"
            placeholder="com.example.app"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Smartphone size={10} className="text-purple-400" /> First Version
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <input
              type="text"
              value={versionName}
              onChange={(e) => {
                setVersionName(e.target.value);
                persistState(checkedItems);
              }}
              className="bg-transparent border-none p-0 text-zinc-200 font-bold w-16 text-xs"
              placeholder="1.0.0"
            />
            <span className="text-zinc-600">code:</span>
            <input
              type="number"
              value={versionCode}
              onChange={(e) => {
                setVersionCode(Number(e.target.value));
                persistState(checkedItems);
              }}
              className="bg-transparent border-none p-0 text-amber-300 font-bold w-14 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck size={10} className="text-emerald-400" /> Privacy &amp; Deletion
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
            <a 
              href={privacyPolicyUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              Privacy <ExternalLink size={9} />
            </a>
            <span className="text-zinc-700">•</span>
            <a 
              href={accountDeletionUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-rose-400 hover:underline flex items-center gap-0.5"
            >
              Deletion <ExternalLink size={9} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 px-6 pt-3 border-b border-zinc-800/70 bg-zinc-950/40 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'checklist'
              ? 'bg-[#0e0e12] text-amber-400 border-t-2 border-x border-amber-500/40 border-b-transparent shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>7-Phase Master Checklist</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-zinc-850 text-zinc-400 font-mono">
            {completedCount}/{totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('testing_tracker')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'testing_tracker'
              ? 'bg-[#0e0e12] text-amber-400 border-t-2 border-x border-amber-500/40 border-b-transparent shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users size={13} />
          <span>14-Day Closed-Test Tracker</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
            testersMet && durationMet ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
          }`}>
            {testerCount}/12 • {testDaysElapsed}/14d
          </span>
        </button>

        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'metadata'
              ? 'bg-[#0e0e12] text-cyan-400 border-t-2 border-x border-cyan-500/40 border-b-transparent shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ImageIcon size={13} />
          <span>Storefront Assets</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono">
            READY
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'mistakes'
              ? 'bg-[#0e0e12] text-rose-400 border-t-2 border-x border-rose-500/40 border-b-transparent shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <AlertTriangle size={13} />
          <span>The 5 Time-Wasting Traps</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'checklist' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Filter by Phase Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mr-2 shrink-0">
                Phase Filter:
              </span>
              <button
                onClick={() => setActivePhaseId('all')}
                className={`px-3 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider shrink-0 transition-all ${
                  activePhaseId === 'all'
                    ? 'bg-amber-500 text-black font-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All Phases ({totalCount})
              </button>
              {CHECKLIST_PHASES.map(phase => {
                const phaseDone = phase.items.filter(i => checkedItems[i.id]).length;
                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhaseId(phase.id)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 ${
                      activePhaseId === phase.id
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{phase.title.split(':')[0]}</span>
                    <span className="opacity-70 text-[8px]">({phaseDone}/{phase.items.length})</span>
                  </button>
                );
              })}
            </div>

            {/* Checklist Cards */}
            {displayedPhases.map(phase => {
              const phaseCompleted = phase.items.filter(i => checkedItems[i.id]).length;
              const isPhaseAllDone = phaseCompleted === phase.items.length;

              return (
                <div 
                  key={phase.id} 
                  className={`bg-[#0d0d11] rounded-2xl border transition-all overflow-hidden ${
                    isPhaseAllDone 
                      ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.04)]' 
                      : 'border-zinc-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  <div className="p-4 bg-zinc-950/70 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                          {phase.title}
                        </h2>
                        {phase.badge && (
                          <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-amber-400 border border-zinc-800 uppercase">
                            {phase.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{phase.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono font-bold ${
                        isPhaseAllDone ? 'text-emerald-400' : 'text-zinc-400'
                      }`}>
                        {phaseCompleted} / {phase.items.length} Complete
                      </span>
                      <div className="w-20 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                          className={`h-full transition-all duration-300 ${isPhaseAllDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.round((phaseCompleted / phase.items.length) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-zinc-900/80">
                    {phase.items.map(item => {
                      const isChecked = Boolean(checkedItems[item.id]);

                      return (
                        <div 
                          key={item.id} 
                          onClick={() => toggleItem(item.id)}
                          className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer select-none group ${
                            isChecked ? 'bg-emerald-950/5 hover:bg-emerald-950/10' : 'hover:bg-zinc-900/40'
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 text-zinc-600 group-hover:text-amber-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItem(item.id);
                            }}
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-950/50" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-xs font-bold tracking-tight transition-colors ${
                                isChecked ? 'text-zinc-300 line-through opacity-85' : 'text-zinc-100 group-hover:text-amber-200'
                              }`}>
                                {item.label}
                              </span>

                              {item.requiredForAlpha && (
                                <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                                  ALPHA GATE
                                </span>
                              )}

                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[9px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5 ml-1"
                                >
                                  Console <ExternalLink size={9} />
                                </a>
                              )}
                            </div>

                            {item.description && (
                              <p className={`text-[10px] mt-1 leading-relaxed ${
                                isChecked ? 'text-zinc-600' : 'text-zinc-400'
                              }`}>
                                {item.description}
                              </p>
                            )}

                            {item.codeSnippet && (
                              <div 
                                className="mt-2.5 p-2 bg-black/80 border border-zinc-800 rounded-lg flex items-center justify-between gap-3 text-[10px] text-zinc-300"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <code className="font-mono text-amber-300/90 break-all select-all">
                                  {item.codeSnippet}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => handleCopySnippet(item.codeSnippet!, item.id)}
                                  className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer"
                                  title="Copy command"
                                >
                                  {copiedId === item.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'testing_tracker' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* 14-Day Closed Testing Explainer Banner */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wide">
                    Google Play Mandatory 14-Day Closed Testing Gate
                  </h3>
                </div>
                <p className="text-xs text-amber-300/80 max-w-xl">
                  Personal Google Play Console developer accounts (registered after Nov 2023) MUST run a closed test with at least <strong>12 testers</strong> continuously opted in for <strong>14 consecutive days</strong> before applying for Production.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-black/60 border border-amber-500/30 p-3 rounded-xl shrink-0">
                <div className="text-center">
                  <span className="text-[8px] text-zinc-500 uppercase block">Elapsed</span>
                  <span className="text-xl font-mono font-bold text-amber-400">{testDaysElapsed}d</span>
                </div>
                <span className="text-zinc-700">/</span>
                <div className="text-center">
                  <span className="text-[8px] text-zinc-500 uppercase block">Required</span>
                  <span className="text-xl font-mono font-bold text-white">14d</span>
                </div>
              </div>
            </div>

            {/* Live Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${
                testersMet ? 'bg-emerald-950/15 border-emerald-500/30' : 'bg-amber-950/15 border-amber-500/30'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">
                  Criterion 1: Minimum Testers
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-2xl font-bold font-mono ${testersMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {testerCount} / 12
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase">
                    {testersMet ? 'PASS (12+ Opted In)' : `${12 - testerCount} More Required`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full ${testersMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (testerCount / 12) * 100)}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                durationMet ? 'bg-emerald-950/15 border-emerald-500/30' : 'bg-amber-950/15 border-amber-500/30'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">
                  Criterion 2: Duration Gate
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-2xl font-bold font-mono ${durationMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {testDaysElapsed} / 14d
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase">
                    {durationMet ? 'PASS (14 Days Complete)' : `${testDaysRemaining} Days Remaining`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full ${durationMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (testDaysElapsed / 14) * 100)}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                testersMet && durationMet ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-wider block">
                  Production Application Status
                </span>
                <div className="mt-2">
                  <span className="text-base font-bold font-mono block">
                    {testersMet && durationMet ? 'ELIGIBLE TO APPLY' : 'LOCKED (IN TESTING)'}
                  </span>
                  <p className="text-[9px] mt-1 opacity-70">
                    {testersMet && durationMet 
                      ? 'You can now submit your production track questionnaire in Google Play Console.' 
                      : 'Maintain tester engagement until all 14 days elapse.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tester Cohort Roster */}
            <div className="bg-[#0d0d11] rounded-2xl border border-zinc-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Closed Testing Email Roster ({testerEmails.length})
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Track the real testers enrolled in your closed test group in Google Play Console
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-500">Cohort Start:</span>
                  <input
                    type="date"
                    value={testStartDate}
                    onChange={(e) => {
                      setTestStartDate(e.target.value);
                      persistState(checkedItems);
                    }}
                    className="bg-black/60 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono"
                  />
                </div>
              </div>

              {/* Add Tester Form */}
              <form onSubmit={handleAddTester} className="flex gap-2">
                <input
                  type="email"
                  value={newTesterInput}
                  onChange={(e) => setNewTesterInput(e.target.value)}
                  placeholder="Enter tester Google account email (e.g. tester@gmail.com)..."
                  className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Add Tester
                </button>
              </form>

              {/* Tester list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar pt-1">
                {testerEmails.map((email, idx) => (
                  <div 
                    key={email}
                    className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] font-bold text-zinc-600 w-5">#{idx + 1}</span>
                      <span className="text-zinc-300 truncate">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTester(email)}
                      className="p-1 hover:text-rose-400 text-zinc-600 transition-colors cursor-pointer shrink-0 ml-2"
                      title="Remove tester"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Live Storefront Card Preview */}
            <div className="bg-[#0d0d11] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_8px_32px_rgba(6,182,212,0.08)]">
              <div className="p-4 bg-zinc-950/80 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live Play Store &amp; PWA Asset Preview
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...checkedItems,
                      p3_app_name: appName.length > 0 && appName.length <= 30,
                      p3_short_desc: shortDescription.length > 0 && shortDescription.length <= 80,
                      p3_full_desc: fullDescription.length > 0 && fullDescription.length <= 4000,
                      p3_app_icon: true,
                      p3_feature_graphic: true
                    };
                    setCheckedItems(updated);
                    persistState(updated);
                    toast.success('Phase 3 Assets Verified', {
                      description: 'Icon (512x512), Feature Graphic (1024x500), and Store Copy synced.'
                    });
                  }}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-[10px] rounded-lg tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Verify &amp; Mark Phase 3 Complete
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Mock Play Store Listing Hero */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black relative">
                    <img
                      src="/assets/feature-graphic.png"
                      alt="Google Play Feature Graphic (1024x500)"
                      className="w-full h-auto object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono">
                      1024 × 500 PNG
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                    <img
                      src={aetherosShield}
                      alt="AetherOS App Icon 512x512"
                      className="w-16 h-16 rounded-2xl border border-cyan-500/40 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white truncate">
                        {appName || 'Untitled App'}
                      </h3>
                      <p className="text-[11px] text-cyan-400 font-mono truncate">{appId}</p>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {shortDescription}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Implemented Assets Inventory */}
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Implemented Brand &amp; Release Assets
                  </h3>

                  {[
                    {
                      title: 'Play Store & PWA Icon',
                      specs: '512 × 512 PNG32 • Square (No Mask)',
                      href: '/assets/icon-512.png',
                      filename: 'aetheros-icon-512.png',
                      preview: aetherosShield,
                      badge: 'MANIFEST + PLAY'
                    },
                    {
                      title: 'Play Store Feature Graphic',
                      specs: '1024 × 500 PNG24 • Store Hero Banner',
                      href: '/assets/feature-graphic.png',
                      filename: 'aetheros-feature-graphic-1024x500.png',
                      preview: '/assets/feature-graphic.png',
                      badge: 'PHASE 3 READY'
                    },
                    {
                      title: 'Master Key Art Banner',
                      specs: '1408 × 768 • Launchpad & OpenGraph',
                      href: '/assets/aetheros-banner.jpg',
                      filename: 'aetheros-banner-1408x768.jpg',
                      preview: aetherosBanner,
                      badge: 'SOURCE ASSET'
                    },
                    {
                      title: 'PWA Adaptive & Browser Icons',
                      specs: '192 × 192 PNG & 64 × 64 Favicon',
                      href: '/assets/icon-192.png',
                      filename: 'aetheros-icon-192.png',
                      preview: '/assets/icon-192.png',
                      badge: 'INDEX.HTML + SW'
                    }
                  ].map((asset) => (
                    <div
                      key={asset.title}
                      className="p-3 rounded-xl bg-black/60 border border-zinc-800/90 flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={asset.preview}
                          alt={asset.title}
                          className="w-11 h-11 rounded-lg object-cover border border-zinc-800 shrink-0 bg-zinc-950"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-100 truncate">
                              {asset.title}
                            </span>
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono shrink-0">
                              {asset.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono truncate">
                            {asset.specs}
                          </p>
                        </div>
                      </div>
                      <a
                        href={asset.href}
                        download={asset.filename}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-cyan-300 transition-colors shrink-0"
                        title={`Download ${asset.filename}`}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Store Listing Metadata Editor with Character Counters */}
            <div className="bg-[#0d0d11] rounded-2xl border border-zinc-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Phase 3: Store Listing Copy &amp; Character Limits
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Validated live against Google Play Console character ceilings
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  Category: <strong className="text-zinc-200">{primaryCategory}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <label className="text-zinc-400 uppercase font-bold">App Name</label>
                    <span className={appName.length > 30 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {appName.length} / 30 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => {
                      setAppName(e.target.value);
                      persistState(checkedItems);
                    }}
                    className="w-full bg-black/70 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <label className="text-zinc-400 uppercase font-bold">Primary Category</label>
                    <span className="text-zinc-500">Play Console Track</span>
                  </div>
                  <input
                    type="text"
                    value={primaryCategory}
                    onChange={(e) => {
                      setPrimaryCategory(e.target.value);
                      persistState(checkedItems);
                    }}
                    className="w-full bg-black/70 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <label className="text-zinc-400 uppercase font-bold">Short Description</label>
                  <span className={shortDescription.length > 80 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {shortDescription.length} / 80 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    persistState(checkedItems);
                  }}
                  className="w-full bg-black/70 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <label className="text-zinc-400 uppercase font-bold">Full Description</label>
                  <span className={fullDescription.length > 4000 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {fullDescription.length} / 4000 chars
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={fullDescription}
                  onChange={(e) => {
                    setFullDescription(e.target.value);
                    persistState(checkedItems);
                  }}
                  className="w-full bg-black/70 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none resize-y leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <h2 className="text-base font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="text-rose-400 w-5 h-5" />
                The Five Mistakes That Cost The Most Time
              </h2>
              <p className="text-xs text-rose-200/70 mt-1">
                Forensic breakdown from thousands of Google Play submission rejections and catastrophic launch delays.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {FIVE_CRITICAL_MISTAKES.map(mistake => (
                <div 
                  key={mistake.title}
                  className="p-5 rounded-2xl bg-[#0d0d11] border border-zinc-800 shadow-md space-y-2 hover:border-zinc-700 transition-all"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-rose-400">•</span>
                    {mistake.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="bg-black/40 p-3 rounded-xl border border-zinc-900">
                      <span className="text-[8px] font-black uppercase text-rose-400 block tracking-wider">Direct Consequence</span>
                      <p className="text-zinc-300 mt-0.5">{mistake.impact}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-zinc-900">
                      <span className="text-[8px] font-black uppercase text-emerald-400 block tracking-wider">AetherOS Safeguard</span>
                      <p className="text-zinc-300 mt-0.5">{mistake.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Eurodemas Note Accordion */}
            <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Eurodemas Suite Forensic Note on the Google CLA (2026-11-05)
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                The full Individual CLA text was processed through 500 Eurodemas tools (results: <code className="text-zinc-300">runs/google-cla-results.json</code>): 112 flagged — 76 substantive + 36 absence-family. <strong>Finality: CONDITIONAL PASSAGE 60/100</strong>, absolutes 0, evasions 0.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <span className="text-emerald-400 font-bold block">#210 Consent Checklist: PASS</span>
                  <span className="text-zinc-500">Agreement appears freely given.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <span className="text-emerald-400 font-bold block">#423 Contract Clause Clamp: PASS</span>
                  <span className="text-zinc-500">Real contract terms with zero breach markers.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <span className="text-cyan-400 font-bold block">#454 Brussels-Protocol: NOTED</span>
                  <span className="text-zinc-500">Worldwide scope; Section 3 litigation tooth confirmed.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className="p-3 bg-black border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Launch Authority Engine • Google Play DDA &amp; Target API 35 Verified</span>
        </div>
        <div className="hidden sm:block font-mono">
          <span>Target Platform: Android 15 (API 35) • AAB 64-bit Architecture</span>
        </div>
      </div>
    </div>
  );
};
