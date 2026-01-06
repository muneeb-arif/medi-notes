#!/usr/bin/env bash
# init-structure.sh
# Initializes folder structure for Medi Note (Expo + React Native)

set -e

echo "Creating base directories..."

mkdir -p app
mkdir -p src/{app,navigation,theme,components,features,services,store,utils,domain}
mkdir -p assets/{fonts,images,icons}
mkdir -p docs
mkdir -p tests/{unit,integration}

echo "Creating feature directories..."

FEATURES=(
  auth onboarding home profiles conditionProfiles emergency
  reports vitals medications appointments doctors
  notifications settings consent accessLog timeline
)

for feature in "${FEATURES[@]}"; do
  mkdir -p src/features/$feature/{screens,components,api,hooks}
  touch src/features/$feature/types.ts
  touch src/features/$feature/constants.ts
done

echo "Creating theme files..."
touch src/theme/{colors.ts,typography.ts,spacing.ts,radius.ts,shadows.ts,index.ts}

echo "Creating service files..."
touch src/services/{apiClient.ts,auth.service.ts,profile.service.ts,share.service.ts,analytics.service.ts}

echo "Creating store files..."
touch src/store/{session.store.ts,ui.store.ts,featureFlags.store.ts}

echo "Creating util files..."
touch src/utils/{date.ts,validation.ts,files.ts,logging.ts}

echo "Creating app provider..."
touch src/app/AppProviders.tsx

echo "Creating navigation files..."
touch src/navigation/{RootNavigator.tsx,AuthNavigator.tsx,MainTabsNavigator.tsx}

echo "Creating placeholder README files..."
touch docs/README.md
touch src/features/README.md

echo "Done! Folder structure initialized."
