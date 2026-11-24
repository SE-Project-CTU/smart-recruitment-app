---
name: cv-template-creator
description: End-to-end protocol to create and register a new CV template from a mockup image. Covers visual breakdown, cross-stack schema inspection, Cloudinary admin upload via Backend API, idempotent SQL seeding, and Frontend Code-driven Registry integration with Tiptap WYSIWYG, DnD, AI highlight store, dual primary colors, conditional avatar crop upload, and React performance memoization.
when_to_use: "When asked to create, add, or implement a new CV template from an image, mockup, or specification. Follows the Code-driven Registry + Admin Metadata architecture. NOT for modifying existing template styles or general CV builder fixes."
allowed-tools: Read, Write, Edit, Grep, Glob, run_command
version: 1.3.1
effort: medium
---

# cv-template-creator — Standardized CV Template Creation Protocol

> **Core Architectural Principle:** **Code-driven Registry + Admin Metadata**.  
> Never build a free-form DOM/CSS drag-and-drop builder for the Admin Client. All presentation layouts, dual primary color bridges, avatar crop upload, A4 PDF print pagination rules, AI Rewrite section highlight tracking (`useCvHighlightStore`), and ATS parser compatibility must be managed strictly via Frontend React code paired with seed metadata in the Database.

---

## 1. Mandatory Input Ingestion & Naming Conventions

Before starting implementation, collect or derive these 4 standardized identifiers from the mockup image filename (e.g., `classic_harvard.webp`):

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

## 2. Phased Implementation Protocol

Execute the 6 phases sequentially. Verify every acceptance checkbox in the current phase before moving to the next phase.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Visual Breakdown & Cross-Stack Schema Inspection              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Upload Thumbnail via Backend Media API & Idempotent SQL Seed  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Frontend Type Definitions & Dual Primary Colors Bridge        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Component Hierarchy, Avatar Crop Upload & Section Styling     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Rules of Hooks Compliance, Memoization & Template Registry    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 6: Build Verification, ESLint Check & Visual Acceptance          │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Mockup Analysis & Cross-Stack Schema Inspection

- [ ] **Inspect Template Mockup (`imagePath`) using `Read`**:
  - **Area Layout**: Single-column (`supportedAreaIds: ["main"]`) or two-column (`supportedAreaIds: ["sidebar", "main"]`).
  - **Profile Header**: Circular avatar (`rounded-full`), rounded square (`rounded-xl`), or text-only header without avatar; contact details layout (2-column grid, 3-column grid, or inline separator bar).
  - **Section Titles**: Full-width tinted banner, bottom accent border, or solid badge block.
  - **Section Items**: Two-column split (`col-span-3` period / `col-span-9` details) or sequential vertical stack; `skills` rendered as a 2-column bulleted grid or inline skill pills.
- [ ] **Cross-Stack Schema & Codebase Inspection**:
  - Run `Grep` for `senior_harvard` across `Frontend/` and `Backend/` to find every file referencing template codes.
  - Inspect `Frontend/src/types/cv.ts` and `Frontend/src/features/cv/templates/templateMetadata.ts` to confirm exact schemas for `defaultLayout`, `defaultContent`, `metadata.defaultStyle`, `profile`, and `sections`.
  - Inspect Backend whitelist validator: `Backend/src/SmartHire.Application/Features/Cv/Commands/UpdateCv/CvDocumentUpdateValidator.cs` $\rightarrow$ add `"<templateCode>"` if allowed template codes are validated there.
  - Inspect reference template components: `Frontend/src/features/cv/templates/SeniorHarvard/*` (1-column) or `Frontend/src/features/cv/templates/SidebarClassic/*` (2-column).

---

### Phase 2: Upload Thumbnail via Backend Media API & Idempotent SQL Seed

> **Strict Security & Pipeline Rules:**
>
> 1. Never read `Cloudinary__ApiKey` or `Cloudinary__ApiSecret` from `Backend/.env` to call `api.cloudinary.com` directly. Always upload through `POST /api/v1/media/upload/image` so Backend routes the asset to `folder: "images"` and creates a valid foreign key record in `media_files`.
> 2. Never hardcode or fallback `ADMIN_EMAIL` or `ADMIN_PASSWORD`. Load them from `Backend/.env` (or active environment variables); if missing or still set to placeholders (`<...>`), halt immediately and ask the user.

- [ ] **Authenticate & Upload Mockup Thumbnail**:

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

  # 2. Authenticate as Admin (halting if Backend is unreachable)
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

  # 3. Upload template mockup image via Backend Media Controller
  $imagePath = "temp\cv-templates\<file_name>.<ext>"
  $form = @{
      file = Get-Item $imagePath
  }

  $uploadRes = Invoke-RestMethod -Uri "$apiBaseUrl/media/upload/image" `
      -Method Post -Headers @{ Authorization = "Bearer $adminToken" } `
      -Form $form -ErrorAction Stop

  $thumbnailFileId = $uploadRes.data.id
  # Preserve $thumbnailFileId (GUID) for the SQL seed step
  ```

- [ ] **Generate & Apply Idempotent SQL Seed**:
  - Save the SQL seed inside a Git-tracked directory: `temp/scripts/seeds/cv_template_<templateCode>.sql` (keep mockup images in `temp/cv-templates/`).
  - **Mandatory JSON & Data Hygiene Rules**:
    - Table column: `language = 'vi'`.
    - Inside `default_content.metadata`: set `"language": "vi"` as a string literal (never use an integer such as `1`, which crashes `CvDocumentFontSizeBackfiller` in EF Core).
    - Configure dual primary colors in `default_content.metadata.defaultStyle`: `"primaryColors": ["#Color1", "#Color2"]`.
    - Explicitly set `metadata.defaultStyle.fontFamily` to a valid ID matching `DEFAULT_CV_FONT_ID`.
    - Include all 9 standard keys from `FIXED_SECTION_KEYS` (`objective`, `education`, `experience`, `projects`, `skills`, `certifications`, `awards`, `interests`, `additionalInfo`) in `default_layout.areas` without duplicates or omissions.
    - `profile.phone` MUST be a valid 10-digit Vietnamese phone number without spaces or hyphens (e.g., `"0912345678"`).
  - **Self-Contained & Idempotent SQL Upsert Template**:

    > **Foreign Key Safety Rule:** Template enforces `FOREIGN KEY (thumbnail_file_id) REFERENCES media_files(id)`. To guarantee the seed runs cleanly on fresh databases (CI/CD or teammates' machines), the script must automatically create the `media_files` record (linked to an existing Admin user) if it does not already exist.

    ```sql
    DO $$
    DECLARE
        v_admin_id uuid;
        v_media_id uuid := '<THUMBNAIL_MEDIA_FILE_ID>';
    BEGIN
        -- 1. BẢO ĐẢM KHÓA NGOẠI: Tạo bản ghi media_files nếu chưa có (tránh lỗi FK trên DB mới)
        IF NOT EXISTS (SELECT 1 FROM public.media_files WHERE id = v_media_id) THEN
            SELECT u.id INTO v_admin_id
            FROM public.users u
            LEFT JOIN public.user_roles ur ON u.id = ur.user_id
            ORDER BY ur.role_id NULLS LAST
            LIMIT 1;

            IF v_admin_id IS NOT NULL THEN
                INSERT INTO public.media_files (
                    id, owner_id, file_name, file_url, file_type, file_size, public_id, created_at
                ) VALUES (
                    v_media_id,
                    v_admin_id,
                    '<templateCode>.webp',
                    '<CLOUDINARY_FILE_URL>',
                    'image/webp',
                    124118,
                    '<CLOUDINARY_PUBLIC_ID>',
                    NOW()
                );
            END IF;
        END IF;

        -- 2. UPSERT BẢNG cv_templates
        IF EXISTS (SELECT 1 FROM public.cv_templates WHERE code = '<templateCode>') THEN
            UPDATE public.cv_templates
            SET name = '<templateName>',
                description = '<Concise and description of roles style target template>',
                version = '1.0',
                default_layout = $json$<DEFAULT_LAYOUT_JSON>$json$::jsonb,
                default_content = $json$<DEFAULT_CONTENT_JSON>$json$::jsonb,
                thumbnail_file_id = v_media_id,
                language = 'vi',
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
                '<Concise and description of roles style target template>',
                '1.0',
                $json$<DEFAULT_LAYOUT_JSON>$json$::jsonb,
                $json$<DEFAULT_CONTENT_JSON>$json$::jsonb,
                'vi',
                true,
                NOW(), NOW(),
                v_media_id
            );
        END IF;
    END $$;
    ```

  - Execute the script against the local PostgreSQL database configured in `Backend/.env` (`POSTGRES_DB`, `POSTGRES_USER`) via `psql` or `docker exec` (check active container name via `docker ps`, e.g., `smarthire-db-1`).

---

### Phase 3: Frontend Type Definitions & Dual Primary Colors Bridge

- [ ] **Update Type Definitions & Metadata**:
  - `Frontend/src/types/cv.ts`: Append `"<templateCode>"` to the `CvTemplateCode` union type.
  - `Frontend/src/features/cv/templates/templateMetadata.ts`: Register `<templateCode>` in `CV_TEMPLATE_METADATA` matching `supportedAreaIds` and `defaultLayout.areas` from Phase 2.
- [ ] **Dual Primary Colors & CSS Custom Properties Bridge**:
  - `Color 1` (`--cv-primary-1`): Section headings (`h3`), candidate full name, and title accent borders.
  - `Color 2` (`--cv-primary-2`): Section title banner fill or sidebar background fill.
  - Define CSS Custom Properties on **both** the root `.cv-page-container` and the `@hello-pangea/dnd` dragging snapshot portal wrapper (since dragged items portal to `document.body` and lose ancestor CSS variables):

    ```tsx
    const primaryColor = globalStyles?.primaryColors?.[0] || "#0F172A";
    const bannerBgColor = globalStyles?.primaryColors?.[1] || "#F1F5F9";

    const cssVars = {
      fontFamily: getCvFontFamilyCss(fontFamily),
      lineHeight,
      ["--cv-font-scale" as string]: fontScale,
      ["--cv-line-height" as string]: lineHeight,
      ["--cv-primary-1" as string]: `var(--cv-preview-primary-1, ${primaryColor})`,
      ["--cv-primary-2" as string]: `var(--cv-preview-primary-2, ${bannerBgColor})`,
    } as React.CSSProperties;

    // Apply cssVars to root container AND to dragged item wrapper when snapshot.isDragging === true
    ```

---

### Phase 4: Component Hierarchy, Avatar Handling & Section Styling

Create directory `Frontend/src/features/cv/templates/<componentDirName>/`:

- [ ] **`ProfileHeader.tsx` (Header & Conditional Avatar Crop Upload)**:
  - Render candidate name, title, and contact fields via `renderField(...)`.
  - **If the mockup design includes an avatar**:
    - Integrate `useImageCropUpload` + `ImageUploadDialog` (`aspectRatio={1}`, `shape="circle"`, `maxOutputDimension={512}`).
    - Upload cropped file via `mediaService.uploadImage(croppedFile)` and clean up replaced temporary uploads in the same session via `useDeleteMedia`.
    - Update form state with `useFormContext().setValue("content.profile.avatarUrl", url, { shouldDirty: true, shouldValidate: true })`.
    - Provide clean UX states: empty state (`Camera` icon + _"Chọn ảnh"_), uploading state (`Loader2` spinner + _"Đang tải..."_), hover overlay (_"Đổi ảnh"_ with keyboard accessibility), and hide interactive overlays during print/read-only mode (`no-print`).
  - **If the mockup design is text-only (no avatar)**: omit avatar upload hooks and imports cleanly so ESLint reports zero unused variables.
- [ ] **`SectionTitle.tsx` (or `SectionHeading.tsx` matching codebase convention)**:
  - Must include `break-after-avoid` to prevent orphaned headings at the bottom of printed A4 pages.
  - Apply `backgroundColor: var(--cv-primary-2, ${bannerBgColor})` and `color: var(--cv-primary-1, ${primaryColor})`.
- [ ] **9 Dedicated Section Components (`*Section.tsx`)**:
  - `ObjectiveSection.tsx`, `EducationSection.tsx`, `ExperienceSection.tsx`, `SkillsSection.tsx`, `ProjectsSection.tsx`, `CertificationsSection.tsx`, `AwardsSection.tsx`, `InterestsSection.tsx`, `AdditionalInfoSection.tsx`.
  - Every repeating entry (job, school, project, award) must include `break-inside-avoid` to prevent split items across A4 pages.
  - Integrate `ItemActions` via `sectionEditors` for adding, removing, and reordering entries in edit mode.

---

### Phase 5: Rules of Hooks Compliance, Memoization & Template Registry

- [ ] **Strict Rules of Hooks Compliance**:
  - **NEVER** call any React Hook (`useCvHighlightStore`, `useMemo`, `useCallback`, `useState`, `useRef`, `useFormContext`) after an early return (`if (!content) return null`, `if (!mainArea) return null`).
  - Declare all Hooks unconditionally at the top of the component function; place early-return guards **after** all Hooks.
- [ ] **Performance Optimization & Derived State**:
  - Use `useMemo` for derived values (`visibleSections`, `mainArea`, `supportedAreaIds`, `unknownAreas`, `avatarSrc`, `cssVars`).
  - Use `useCallback` for event handlers and render helpers (`isSectionVisible`, `handleDragEnd`, `moveSection`, `renderSectionContent`, `handleCropConfirm`, `handleRemoveAvatar`).
- [ ] **Prevent Cascading Re-renders (`React.memo`)**:
  - Wrap `<componentDirName>Template`, `ProfileHeader`, `SectionTitle`, and all 9 section components in `React.memo` and assign explicit `.displayName` properties.
- [ ] **Register in `registry.ts`**:
  - Add `<templateCode>: <componentDirName>Template` to `TEMPLATE_REGISTRY` in `Frontend/src/features/cv/templates/registry.ts`.

---

### Phase 6: Build Verification, ESLint Check & Visual Acceptance

- [ ] **Static Type-Checking & Linting**:
  ```powershell
  cd Frontend
  pnpm exec tsc --noEmit
  pnpm exec eslint src/features/cv/templates/<componentDirName>
  ```
  _Requirement:_ 0 errors and 0 warnings (specifically zero `react-hooks/rules-of-hooks` or unused import issues).
- [ ] **Production Bundle Build**:
  ```powershell
  pnpm run build
  ```
  _Requirement:_ Vite production build completes cleanly with 0 errors.
- [ ] **End-to-End Visual & Functional Verification**:
  - **Admin Catalog (`/admin/catalogs?tab=cv-templates`)**: New template displays proper thumbnail, title, and description; preview modal and active toggle work properly.
  - **Candidate Gallery (`/cv/templates`) & Builder**: Creating a CV initializes all 9 sections with valid Vietnamese seed content; switching **Color 1** and **Color 2** updates headings and banners immediately; DnD reordering preserves colors mid-drag; AI Rewrite highlights targeted sections.
  - **A4 Print Preview (`Ctrl + P`)**: Clean page breaks (`break-inside-avoid`, `break-after-avoid`) with all editor controls hidden (`no-print`).

---

## 3. Inviolable Guardrails

1. **ATS Compatibility**: Render all CV text as real DOM text nodes; never replace text with canvas or SVG imagery.
2. **Fixed Section Keys**: Retain all 9 keys from `FIXED_SECTION_KEYS` (`objective`, `experience`, `education`, `skills`, `projects`, `certifications`, `awards`, `interests`, `additionalInfo`) across `defaultLayout.areas`.
3. **No Direct Admin Free-Form Builder**: Never build generic DOM/CSS canvas editors for the admin client.
4. **Print Pagination Protection**: Repeating section items must carry `break-inside-avoid`, and section headings must carry `break-after-avoid`.
5. **Valid Seed Data & Language String**: Seeded `default_content` must use a valid 10-digit Vietnamese phone number (`0912345678`), an allowed `fontFamily` ID, and string `"language": "vi"` (never integer `1`).
6. **Zero Hardcoded or Fallback Credentials**: Never hardcode or fallback `ADMIN_EMAIL` or `ADMIN_PASSWORD`. Load them from `Backend/.env` or process environment variables, and stop to ask the user if unset.
7. **Mandatory Backend Media API Pipeline**: Never bypass `POST /api/v1/media/upload/image` with direct Cloudinary API calls using `Cloudinary__*` secrets from `.env`.
