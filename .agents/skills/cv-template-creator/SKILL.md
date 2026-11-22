---
name: cv-template-creator
description: End-to-end protocol to create and register a new CV template from a mockup image. Covers visual breakdown, schema inspection, Cloudinary admin upload via Backend API, idempotent SQL seeding, and Frontend Code-driven Registry integration with Tiptap WYSIWYG, DnD, AI highlight store, and A4 print pagination.
when_to_use: "When asked to create, add, or implement a new CV template from an image, mockup, or specification. Follows the Code-driven Registry + Admin Metadata architecture. NOT for modifying existing template styles or general CV builder fixes."
allowed-tools: Read, Write, Edit, Grep, Glob, run_command
version: 1.2.1
effort: medium
---

# cv-template-creator — Standardized CV Template Creation Protocol

> **Core Architectural Principle:** **Code-driven Registry + Admin Metadata**.  
> Never build a free-form DOM/CSS drag-and-drop builder for the Admin Client. All presentation layouts, A4 PDF print pagination rules, AI Rewrite section highlight tracking (`useCvHighlightStore`), and ATS parser compatibility must be managed strictly via Frontend React code paired with seed metadata in the Database.

---

## 1. Mandatory Input Ingestion & Naming Conventions

Before starting the implementation, collect or derive these 4 standardized identifiers from the mockup image filename (e.g., `classic_harvard.webp`):

1. **Template Mockup Image (`imagePath`)**:
   - Supported extensions: `.webp`, `.png`, `.jpg`, `.jpeg`.
   - Recommended temporary directory: `temp/cv-templates/<file_name>.<ext>`.
2. **Template Code (`templateCode` — `snake_case`)**:
   - Derived from the image filename converted to lowercase with underscores (e.g., `classic_harvard`).
3. **Template Display Name (`templateName` — `Title Case`)**:
   - If omitted by the user, format `templateCode` into Title Case (e.g., `Classic Harvard`).
4. **Component Directory Name (`componentDirName` — `PascalCase`)**:
   - Format `templateCode` into PascalCase for the Frontend component folder (e.g., `ClassicHarvard`).

---

## 2. End-to-End Implementation Workflow

```text
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Mockup Analysis & Visual Breakdown                  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Reference & Schema Inspection (Frontend + Backend)  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Upload Thumbnail via Backend Media API              │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Generate & Apply Idempotent Database SQL Seed       │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Implement Frontend Component & Code-driven Registry │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Type-Check, Build Verification & E2E Testing        │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 1: Mockup Analysis & Visual Breakdown

Inspect the template mockup image using the `Read` tool on `imagePath`:

- **Determine Area Layout**:
  - Single-column flow: `supportedAreaIds: ["main"]`.
  - Two-column flow (sidebar + main): `supportedAreaIds: ["sidebar", "main"]`.
- **Profile Header Breakdown**:
  - Avatar styling: circular (`rounded-full`), rounded square (`rounded-xl`), or no avatar.
  - Contact details layout: 2-column or 3-column grid, icon lists, or inline separator bars.
- **Section Presentations**:
  - Section heading styling: full-width tinted banner, bottom accent border, or badge pills.
  - Content presentation: two-column layout (left: dates/period, right: company/role/bullet list) or sequential block layout.
  - Specific `skills` presentation: 2-column bulleted grid or inline skill badge tags.

---

### Step 2: Reference & Schema Inspection (Mandatory Before SQL & Code)

Before writing any SQL seed JSON or React component, inspect the existing codebase so schemas, validators, and prop signatures match 100%:

1. **Cross-Stack Code Search**:
   - Run `Grep` for `senior_harvard` across both `Frontend/` and `Backend/` to locate every file referencing template codes (e.g., TypeScript unions, Zod schemas, Backend seeders/initializers, or validators).
2. **Inspect Frontend Types & Metadata**:
   - Use `Read` on `Frontend/src/types/cv.ts` and `Frontend/src/features/cv/templates/templateMetadata.ts` to verify the exact structure of `defaultLayout`, `defaultContent`, `metadata.defaultStyle`, `profile`, and `sections`.
3. **Inspect Reference Template Components**:
   - If implementing a **1-column** template $\rightarrow$ inspect `Frontend/src/features/cv/templates/SeniorHarvard/*`.
   - If implementing a **2-column** template $\rightarrow$ inspect `Frontend/src/features/cv/templates/SidebarClassic/*`.

---

### Step 3: Upload Thumbnail via Backend Media API

Every row in `cv_templates` enforces a foreign key constraint `thumbnail_file_id -> media_files(id)`.

**Strict Security & Pipeline Rules:**

1. **Never Bypass Backend API:** Do **NOT** read `Cloudinary__ApiKey` or `Cloudinary__ApiSecret` from `Backend/.env` to upload directly to `api.cloudinary.com`. Always upload through `POST /api/v1/media/upload/image` so Backend handles folder routing (`images`) and inserts the `media_files` row.
2. **Zero Hardcoded Credentials:** Load `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `API_HOST_PORT` directly from `Backend/.env` (or active process environment variables). If missing or still set to placeholders (`<...>`), halt immediately and ask the user.
3. **Backend Reachability Gate:** If the Backend API is unreachable, halt immediately and ask the user to start the Backend server before retrying.

```powershell
# 1. Parse Backend/.env into current process environment (stripping surrounding quotes)
$envFile = "Backend\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.*)\s*$') {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim() -replace '^[''"]|[''"]$', ''
            if (-not [Environment]::GetEnvironmentVariable($key)) {
                [Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
}

$adminEmail = $env:ADMIN_EMAIL
$adminPassword = $env:ADMIN_PASSWORD

if ([string]::IsNullOrWhiteSpace($adminEmail) -or $adminEmail -like "<*>" -or
    [string]::IsNullOrWhiteSpace($adminPassword) -or $adminPassword -like "<*>") {
    throw "Missing or unconfigured ADMIN_EMAIL / ADMIN_PASSWORD in Backend/.env. Stop and ask the user before proceeding."
}

$apiPort = if ($env:API_HOST_PORT) { $env:API_HOST_PORT } else { "5190" }
$apiBaseUrl = if ($env:VITE_API_BASE_URL) { $env:VITE_API_BASE_URL.TrimEnd('/') } else { "http://localhost:$apiPort/api/v1" }

# 2. Authenticate as Admin (halting if Backend is not running)
$loginBody = @{
    email    = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri "$apiBaseUrl/auth/login" `
        -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
} catch {
    throw "Failed to authenticate against $apiBaseUrl/auth/login. Ensure the Backend server is running and credentials in Backend/.env are valid. Do NOT call Cloudinary API directly."
}

$adminToken = $loginRes.data.tokens.accessToken

# 3. Upload template mockup image via Backend Media Controller (routes to folder: "images")
$imagePath = "temp\cv-templates\<file_name>.<ext>"
$form = @{
    file = Get-Item $imagePath
}

$uploadRes = Invoke-RestMethod -Uri "$apiBaseUrl/media/upload/image" `
    -Method Post -Headers @{ Authorization = "Bearer $adminToken" } `
    -Form $form -ErrorAction Stop

$thumbnailFileId = $uploadRes.data.id
# Preserve $thumbnailFileId (GUID) for Step 4
```

---

### Step 4: Generate & Apply Idempotent Database SQL Seed

> **Repository Boundary Rule:** Always keep all project files strictly within the repository boundary. Never access or output to external folders like `smart-recruitment-docs/`.  
> **Git Tracking Rule:** While temporary mockup images stay in `temp/cv-templates/`, save the `.sql` seed file in a Git-tracked directory (`temp/cv-templates/scripts/seeds/cv_template_<templateCode>.sql`) so all team members receive the template metadata upon pulling code.

1. **`default_layout` JSON Structure**:
   - Must include all 9 standard sections (`FIXED_SECTION_KEYS`) without duplicates or omissions, matching the template's `supportedAreaIds`:

   - **Option A — Single-Column (`["main"]`)**:

     ```json
     {
       "version": "1.0",
       "areas": [
         {
           "id": "main",
           "sections": [
             "objective",
             "education",
             "experience",
             "projects",
             "skills",
             "certifications",
             "awards",
             "interests",
             "additionalInfo"
           ]
         }
       ]
     }
     ```

   - **Option B — Two-Column (`["sidebar", "main"]`)**:
     ```json
     {
       "version": "1.0",
       "areas": [
         {
           "id": "sidebar",
           "sections": ["skills", "certifications", "awards", "interests"]
         },
         {
           "id": "main",
           "sections": [
             "objective",
             "experience",
             "education",
             "projects",
             "additionalInfo"
           ]
         }
       ]
     }
     ```

2. **`default_content` Tiptap JSON Structure & Sample Data Hygiene**:
   - Follow the exact `default_content` schema verified in Step 2.
   - `profile.phone` MUST be a valid 10-digit Vietnamese phone number without spaces or hyphens (e.g., `"0912345678"`).
   - `profile.email` MUST be a valid realistic email address (e.g., `"nguyenvana.dev@example.com"`).
   - `metadata.defaultStyle` MUST explicitly define an allowed `fontFamily` matching `DEFAULT_CV_FONT_ID` in the Frontend codebase.
   - Wrap rich-text fields as valid Tiptap documents:
     ```json
     {
       "type": "doc",
       "attrs": { "fontSize": 12 },
       "content": [
         {
           "type": "paragraph",
           "content": [
             { "type": "text", "text": "Sample professional text..." }
           ]
         }
       ]
     }
     ```

3. **Write & Execute Idempotent SQL Upsert**:
   - Use PostgreSQL dollar-quoting (`$json$ ... $json$::jsonb`) to prevent apostrophe (`'`) syntax errors, and use a `DO $$ ... $$` block so the script is safely re-runnable regardless of whether `code` has a `UNIQUE` constraint:
     ```sql
     DO $$
     BEGIN
         IF EXISTS (SELECT 1 FROM public.cv_templates WHERE code = '<templateCode>') THEN
             UPDATE public.cv_templates
             SET name = '<templateName>',
                 description = '<Concise and description of roles style target template the>',
                 version = '1.0',
                 default_layout = $json$<DEFAULT_LAYOUT_JSON>$json$::jsonb,
                 default_content = $json$<DEFAULT_CONTENT_JSON>$json$::jsonb,
                 thumbnail_file_id = '<THUMBNAIL_MEDIA_FILE_ID>',
                 is_active = true,
                 updated_at = NOW()
             WHERE code = '<templateCode>';
         ELSE
             INSERT INTO public.cv_templates (
                 id, code, name, description, version,
                 default_layout, default_content,
                 language, is_active, created_at, updated_at,
                 thumbnail_file_id
             ) VALUES (
                 gen_random_uuid(),
                 '<templateCode>',
                 '<templateName>',
                 '<Concise and description of roles style target template the>',
                 '1.0',
                 $json$<DEFAULT_LAYOUT_JSON>$json$::jsonb,
                 $json$<DEFAULT_CONTENT_JSON>$json$::jsonb,
                 'vi',
                 true,
                 NOW(), NOW(),
                 '<THUMBNAIL_MEDIA_FILE_ID>'
             );
         END IF;
     END $$;
     ```
   - Execute this SQL file against the local PostgreSQL database configured in `Backend/.env` (`POSTGRES_DB`, `POSTGRES_USER`) via `psql` or `docker exec` (and update any C# Backend seed initializer if discovered during Step 2).

---

### Step 5: Implement Frontend Component & Code-driven Registry

#### 5.1. Update Type Definitions

In `Frontend/src/types/cv.ts`:

- Append `"<templateCode>"` to the `CvTemplateCode` union type.

#### 5.2. Declare Metadata & Layout Rules

In `Frontend/src/features/cv/templates/templateMetadata.ts`:

- Register `<templateCode>` in `CV_TEMPLATE_METADATA` matching the exact `areas` structure from Step 4.1:
  ```typescript
  <templateCode>: {
    code: "<templateCode>",
    name: "<templateName>",
    supportedAreaIds: ["main"] as const, // Or ["sidebar", "main"] as const
    defaultLayout: {
      version: "1.0",
      areas: [
        // Must match Step 4.1 (1-column or 2-column distribution of all 9 FIXED_SECTION_KEYS)
      ],
    },
  },
  ```

#### 5.3. Implement Template React Component Hierarchy

Create directory `Frontend/src/features/cv/templates/<componentDirName>/`:

- **`index.tsx` (Root Template Component)**:
  - Accepts standard `CvTemplateProps`.
  - Wraps droppables using `@hello-pangea/dnd` matching `supportedAreaIds`.
  - Integrates AI highlight state: `const highlightSectionKey = useCvHighlightStore((s) => s.highlightSectionKey)`.
  - Applies theme styling and fonts from `metadata.defaultStyle` via `DEFAULT_CV_FONT_ID` and `getCvFontFamilyCss`.
  - Enforces visibility checks (`sec.visible !== false`).
- **`ProfileHeader.tsx`**:
  - Renders Avatar, Full Name, Title, and Contact Grid.
  - Passes fields through `renderField({ name: "profile.fullName", document: profile.fullName, placeholder: "Full Name" })`.
- **`SectionTitle.tsx` (or `SectionHeading.tsx` matching codebase convention)**:
  - Displays section titles styled to match the template visual identity.
  - **Mandatory CSS Rule:** Must include `break-after-avoid` to prevent orphan headings at the bottom of printed pages.
- **Dedicated Section Files (`*Section.tsx`)**:
  - `ObjectiveSection.tsx`, `EducationSection.tsx`, `ExperienceSection.tsx`, `SkillsSection.tsx`, `ProjectsSection.tsx`, `CertificationsSection.tsx`, `AwardsSection.tsx`, `InterestsSection.tsx`, `AdditionalInfoSection.tsx`.
  - **Mandatory CSS Rule:** Every repeating item (job, school, project) must include `break-inside-avoid` to prevent split lines across A4 pages.
  - Integrates `ItemActions` from `builder/components/ItemActions` via `sectionEditors` for adding, deleting, and reordering items.

#### 5.4. Register in Template Registry

In `Frontend/src/features/cv/templates/registry.ts`:

- Import `<componentDirName>Template`.
- Add to `TEMPLATE_REGISTRY`:
  ```typescript
  export const TEMPLATE_REGISTRY: Record<CvTemplateCode, ComponentType<CvTemplateProps>> = {
    senior_harvard: SeniorHarvardTemplate,
    sidebar_classic: SidebarClassicTemplate,
    <templateCode>: <componentDirName>Template,
  };
  ```

---

### Step 6: Type-Check, Build Verification & End-to-End Testing

1. **Static Analysis & Type Checking**:

   ```powershell
   cd Frontend
   pnpm exec tsc --noEmit && pnpm run build
   ```

   _Requirement:_ Must pass full TypeScript checking and Vite build with 0 Errors.

2. **Functional & Visual Verification**:
   - **Candidate CV Gallery (`/cv/templates`)**: Card displays proper thumbnail, title, and description.
   - **Creation Flow ("Tạo CV từ mẫu")**: Initializes a new CV with all 9 standard sections pre-filled with valid seed content.
   - **Tiptap WYSIWYG Editor**: Interactive inline toolbar appears on focus with rich-text controls.
   - **AI Rewrite Assistant**: Highlights sections with accent border/ring when suggestions are focused.
   - **Admin Catalog (`/admin/catalogs`)**: Preview modal renders the exact React component; toggle active switch functions properly.
   - **A4 PDF Print Preview (`Ctrl + P`)**: Output respects `8mm` margins with clean page breaks and zero orphaned headings.

---

## 3. Inviolable Guardrails

1. **ATS Compatibility**: All text content must be rendered as real DOM text nodes; never replace text with canvas or SVG imagery.
2. **Fixed Section Keys**: Strictly retain all 9 predefined keys from `FIXED_SECTION_KEYS` (`objective`, `experience`, `education`, `skills`, `projects`, `certifications`, `awards`, `interests`, `additionalInfo`) across `defaultLayout.areas`.
3. **No Direct Admin Free-Form Builder**: Do not create generic WYSIWYG canvas/DOM editors for the admin client.
4. **Print Pagination Protection**: Repeating section items must always carry `break-inside-avoid`, and section headings must carry `break-after-avoid`.
5. **Valid Sample Data**: Seeded `default_content` must use a valid 10-digit Vietnamese phone number (e.g., `0912345678`) and an allowed `fontFamily` ID.
6. **Zero Hardcoded or Fallback Credentials**: Never hardcode or fallback `ADMIN_EMAIL` or `ADMIN_PASSWORD`. Always load them from `Backend/.env` or process environment variables, and stop to ask the user if unset.
7. **Mandatory Backend Media Pipeline**: Never bypass `POST /api/v1/media/upload/image` with direct Cloudinary API calls using `Cloudinary__*` secrets from `.env`.
