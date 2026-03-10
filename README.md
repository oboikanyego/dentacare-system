################################################################################
# DentaCare - Git Ignore Configuration
#
# This file defines which files and folders Git should ignore.
# The goal is to prevent committing:
#   • Generated files
#   • Dependencies
#   • Environment secrets
#   • System-specific files
#   • Logs and build artifacts
#
# Tech Stack Used:
#   • Angular (Frontend)
#   • Angular Material (UI)
#   • Node.js + Express (Backend)
#   • MongoDB (Database)
#   • JWT Authentication
#   • Cloudinary (File storage)
#
# Design & Development Principles:
#   • Environment-based configuration
#   • Secure secret management
#   • Clean repository history
#   • No compiled or generated code committed
################################################################################



################################################################################
# NODE.JS DEPENDENCIES
#
# These folders are automatically generated when running `npm install`
# They should never be committed because they are large and reproducible.
################################################################################

node_modules/

npm-debug.log*
yarn-debug.log*
yarn-error.log*

pnpm-debug.log*



################################################################################
# ANGULAR BUILD OUTPUT
#
# Angular generates these folders when running:
#   ng build
#   ng serve
################################################################################

.angular/
.angular/cache/

dist/
tmp/
out-tsc/

coverage/

build/



################################################################################
# TYPESCRIPT CACHE FILES
################################################################################

*.tsbuildinfo



################################################################################
# LOG FILES
#
# Logs generated during development or production runs
################################################################################

logs/
*.log



################################################################################
# ENVIRONMENT VARIABLES (IMPORTANT)
#
# Environment files contain secrets such as:
#   • database credentials
#   • JWT secrets
#   • API keys
#   • email credentials
#
# Never commit these files to Git.
################################################################################

.env
.env.*
!.env.example



################################################################################
# ANGULAR ENVIRONMENT FILES (OPTIONAL)
#
# If you are storing sensitive values in Angular env files.
################################################################################

src/environments/environment.local.ts



################################################################################
# DATABASE FILES / DUMPS
#
# These can contain production data and should not be committed.
################################################################################

*.sql
*.sqlite
*.db
*.dump
*.bak



################################################################################
# FILE UPLOADS / LOCAL STORAGE
#
# Uploaded user files should not be stored in Git repositories.
################################################################################

uploads/
storage/
temp/
tmp/



################################################################################
# TEST OUTPUT
################################################################################

.nyc_output/
coverage/



################################################################################
# OS-SPECIFIC FILES
################################################################################

# Mac
.DS_Store

# Windows
Thumbs.db
desktop.ini



################################################################################
# EDITOR / IDE SETTINGS
#
# These files are local to each developer's environment.
################################################################################

.vscode/
.idea/

*.suo
*.ntvs*
*.njsproj
*.sln



################################################################################
# CACHE FILES
################################################################################

.cache/
.parcel-cache/



################################################################################
# OPTIONAL ARCHIVE FILES
#
# Prevent accidentally committing packaged builds.
################################################################################

*.zip
*.tar
*.gz
*.tgz



################################################################################
# SECURITY NOTE
#
# Do NOT commit secrets to this repository.
#
# Instead, use:
#   .env.example
#
# Developers should create their own `.env` locally based on the example.
################################################################################
