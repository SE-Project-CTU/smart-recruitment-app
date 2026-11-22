---
name: cv-template-creator
description: End-to-end protocol to create and register a new CV template from a mockup image. Covers visual breakdown, Cloudinary admin upload, SQL seeding, and Frontend Code-driven Registry integration with Tiptap WYSIWYG, DnD, AI highlight store, and A4 print pagination.
when_to_use: "When asked to create, add, or implement a new CV template from an image, mockup, or specification. Follows the Code-driven Registry + Admin Metadata architecture. NOT for modifying existing template styles or general CV builder fixes."
allowed-tools: Read, Write, Edit, Grep, Glob, run_command
version: 1.0.0
effort: medium
---

# cv-template-creator — Standardized CV Template Creation Protocol

> **Core Architectural Principle:** **Code-driven Registry + Admin Metadata**.  
> Never build a free-form DOM/CSS drag-and-drop builder for the Admin Client. All presentation layouts, A4 PDF print pagination rules, AI Rewrite section highlight tracking (`useCvHighlightStore`), and ATS parser compatibility must be managed strictly via Frontend React code paired with seed metadata in the Database.

---

## 1. Mandatory Input Ingestion (Socratic Gate & User Inputs)

Before starting the implementation, the agent must collect or derive 3 required inputs:

1. **Template Mockup Image (`imagePath`)**:
   - Supported extensions: `.webp`, `.png`, `.jpg`, `.jpeg`.
   - Recommended directory: `smart-recruitment-app/temp/cv-templates/<file_name>.<ext>`.
2. **Template Code (`templateCode`)**:
   - Default convention: Derived directly from the image filename converted to **lowercase** and separated by underscores `_` (e.g., `classic_harvard.webp` $\rightarrow$ `classic_harvard`).
3. **Template Display Name (`templateName`)**:
   - Default convention: If the user skips or leaves this empty, automatically format the filename into **Title Case** (e.g., `classic_harvard` $\rightarrow$ `Classic Harvard`).

---

## 2. End-to-End Implementation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Mockup Analysis & Visual Breakdown                  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Upload Thumbnail to Cloudinary via Admin API        │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Generate Database SQL Seed (Source of Truth)        │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Implement Frontend Component & Code-driven Registry │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Build Verification & End-to-End Testing             │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 1: Mockup Analysis & Visual Breakdown

1. Inspect the template mockup image (use the `read_file` tool on the image file):
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

### Step 2: Upload Thumbnail to Cloudinary via Admin API

Every row in `cv_templates` enforces a mandatory foreign key constraint `ThumbnailFileId -> media_files(id)`.

Perform the upload using a sandboxed PowerShell command or API invocation:

```powershell
# 1. Authenticate with the default Admin account
$loginBody = @{
    email = "admin@smarthire.com"
    password = "Admin@123456"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
    -Method Post -Body $loginBody -ContentType "application/json"

$adminToken = $loginRes.data.tokens.accessToken

# 2. Upload template mockup image via Media Controller
$imagePath = "smart-recruitment-app\temp\cv-templates\<file_name>.<ext>"

$form = @{
    file = Get-Item $imagePath
}

$uploadRes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/media/upload/image" `
    -Method Post -Headers @{ Authorization = "Bearer $adminToken" } `
    -Form $form

$thumbnailFileId = $uploadRes.data.id
# Preserve $thumbnailFileId (GUID) for the SQL seed step
```

*(Note: If the backend is running in Docker or on a custom port, adjust the base URL accordingly, or query the existing `media_files` table if previously uploaded).*

---

### Step 3: Generate Database SQL Seed (Source of Truth)

Create the seed file at `smart-recruitment-docs/seed-data/cv_template_<template_code>.sql`:

1. **`default_layout` JSON Structure**:
   - Define the `areas` array containing all 9 standard sections (`FIXED_SECTION_KEYS`):
     ```json
     {
       "areas": [
         {
           "id": "main",
           "sections": ["objective", "education", "experience", "projects", "skills", "certifications", "awards", "interests", "additionalInfo"]
         }
       ],
       "version": "1.0"
     }
     ```
2. **`default_content` Tiptap JSON Structure**:
   - Provide valid Tiptap JSON nodes for `metadata`, `profile`, and `sections`.
   - Every single-line string (`fullName`, `title`, `dob`, `phone`, `email`) and multi-line item description must be wrapped as a Tiptap document:
     ```json
     {
       "type": "doc",
       "attrs": { "fontSize": 12 },
       "content": [
         { "type": "paragraph", "content": [{ "type": "text", "text": "Sample professional text..." }] }
       ]
     }
     ```
3. **Execute SQL Insert**:
   ```sql
   INSERT INTO public.cv_templates (
       id, code, name, description, version,
       default_layout, default_content,
       language, is_active, created_at, updated_at,
       thumbnail_file_id
   ) VALUES (
       gen_random_uuid(),
       '<template_code>',
       '<Template Name>',
       '<Concise description of the template style and target roles>',
       '1.0',
       '<DEFAULT_LAYOUT_JSON>',
       '<DEFAULT_CONTENT_JSON>',
       'vi',
       true,
       NOW(), NOW(),
       '<THUMBNAIL_MEDIA_FILE_ID>'
   );
   ```

---

### Step 4: Implement Frontend Component & Code-driven Registry

#### 4.1. Update Type Definitions
In `Frontend/src/types/cv.ts`:
- Append `<template_code>` to the `CvTemplateCode` union type.

#### 4.2. Declare Metadata & Layout Rules
In `Frontend/src/features/cv/templates/templateMetadata.ts`:
- Register `<template_code>` in `CV_TEMPLATE_METADATA`:
  ```typescript
  <template_code>: {
    code: "<template_code>",
    name: "<Template Name>",
    supportedAreaIds: ["main"] as const, // Or ["sidebar", "main"]
    defaultLayout: {
      version: "1.0",
      areas: [
        {
          id: "main",
          sections: [...FIXED_SECTION_KEYS],
        },
      ],
    },
  },
  ```

#### 4.3. Implement Template React Component Hierarchy
Create directory `Frontend/src/features/cv/templates/<PascalCaseTemplateName>/`:
- **`index.tsx` (Root Template Component)**:
  - Accepts standard `CvTemplateProps`.
  - Wraps droppables using `@hello-pangea/dnd` matching `supportedAreaIds`.
  - Integrates AI highlight state: `const highlightSectionKey = useCvHighlightStore((s) => s.highlightSectionKey)`.
  - Applies theme styling and fonts from `metadata.defaultStyle` via `DEFAULT_CV_FONT_ID` and `getCvFontFamilyCss`.
  - Enforces visibility checks (`sec.visible !== false`).
- **`ProfileHeader.tsx`**:
  - Renders Avatar, Full Name, Title, and Contact Grid.
  - Passes fields through `renderField({ name: "profile.fullName", document: profile.fullName, placeholder: "Full Name" })`.
- **`SectionHeading.tsx`**:
  - Displays section titles styled to match the template visual identity.
  - **Mandatory CSS Rule:** Must include `break-after-avoid` to prevent orphan headings at the bottom of printed pages.
- **Dedicated Section Files (`*Section.tsx`)**:
  - `ObjectiveSection.tsx`, `EducationSection.tsx`, `ExperienceSection.tsx`, `SkillsSection.tsx`, `ProjectsSection.tsx`, `CertificationsSection.tsx`, `AwardsSection.tsx`, `InterestsSection.tsx`, `AdditionalInfoSection.tsx`.
  - **Mandatory CSS Rule:** Every repeating item (job, school, project) must include `break-inside-avoid` to prevent split lines across A4 pages.
  - Integrates `ItemActions` from `builder/components/ItemActions` via `sectionEditors` for adding, deleting, and reordering items.

#### 4.4. Register in Template Registry
In `Frontend/src/features/cv/templates/registry.ts`:
- Import `<PascalCaseTemplateName>Template`.
- Add to `TEMPLATE_REGISTRY`:
  ```typescript
  export const TEMPLATE_REGISTRY: Record<CvTemplateCode, ComponentType<CvTemplateProps>> = {
    senior_harvard: SeniorHarvardTemplate,
    sidebar_classic: SidebarClassicTemplate,
    <template_code>: <PascalCaseTemplateName>Template,
  };
  ```

---

### Step 5: Build Verification & End-to-End Testing

1. **Static Analysis & Type Checking**:
   ```powershell
   cd smart-recruitment-app\Frontend
   pnpm run build
   ```
   *Requirement:* Must compile cleanly with 0 Errors and 0 Type Warnings.

2. **Functional & Visual Verification**:
   - **Candidate CV Gallery (`/cv/templates`)**: Card displays proper thumbnail, title, and description.
   - **Creation Flow ("Tạo CV từ mẫu")**: Initializes a new CV with all 9 standard sections pre-filled with seed content.
   - **Tiptap WYSIWYG Editor**: Interactive inline toolbar appears on focus with rich-text controls.
   - **AI Rewrite Assistant**: Highlights sections with accent border/ring when suggestions are focused.
   - **Admin Catalog (`/admin/catalogs`)**: Preview modal renders the exact React component; toggle active switch functions properly.
   - **A4 PDF Print Preview (`Ctrl + P`)**: Output respects `8mm` margins with clean page breaks and zero orphaned headings.

---

## 3. Inviolable Guardrails

1. **ATS Compatibility**: All text content must be rendered as real DOM text nodes; never replace text with canvas or SVG imagery.
2. **Fixed Section Keys**: Strictly retain the 9 predefined keys from `FIXED_SECTION_KEYS` (`objective`, `experience`, `education`, `skills`, `projects`, `certifications`, `awards`, `interests`, `additionalInfo`).
3. **No Direct Admin Free-Form Builder**: Do not create generic WYSIWYG canvas/DOM editors for the admin client.
4. **Print Pagination Protection**: Repeating section items must always carry `break-inside-avoid`.
