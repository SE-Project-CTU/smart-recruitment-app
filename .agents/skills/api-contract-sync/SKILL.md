---
name: api-contract-sync
description: Enforce end-to-end API contract integrity from Backend endpoints and validators down to Frontend DTOs, services, React Query hooks, error mapping, and UI states.
when_to_use: "When adding, modifying, or refactoring APIs, endpoints, DTOs, or data-fetching logic between Backend and Frontend. NOT for UI-only cosmetic changes or pure database migrations without API changes."
allowed-tools: run_command, read_file, edit_file, write_file
effort: medium
version: 1.0.0
---

# api-contract-sync — End-to-End API Contract Synchronization

> Code with zero assumptions: every endpoint change must be synchronized across the entire stack—from Backend validators down to UI loading, empty, and error states.

## Overview

In full-stack architectures, the boundary between Backend and Frontend is the most fragile failure point. A mismatch between a FluentValidation constraint and a frontend form label, a missing field in a TypeScript DTO, or unhandled 400/404 errors leads to broken user flows and silent runtime bugs.

This skill establishes a strict 6-layer verification protocol whenever an API is created, modified, or consumed:

```
[Backend Controller & Validator] 
      ⬇ (Layer 1: Schema & Validation Rules)
[Frontend TypeScript DTOs / Types] 
      ⬇ (Layer 2: 1-to-1 Field & Nullability Match)
[Frontend API Service Client] 
      ⬇ (Layer 3: Method, Route & Payload)
[React Query Hooks (useQuery / useMutation)] 
      ⬇ (Layer 4: Cache Keys & Invalidation Strategy)
[Error Mapping & Validation Sync] 
      ⬇ (Layer 5: Client Validation matching FluentValidation)
[UI States: Loading, Empty, Error, Success] (Layer 6: Complete UX State Coverage)
```

---

## When to Use

✅ **Good for:**
- Adding a new API endpoint in Backend and consuming it in Frontend.
- Modifying request parameters, payload bodies, or response DTOs.
- Updating validation rules in FluentValidation (e.g., min length, required fields).
- Auditing existing endpoints where the UI shows unexpected 400/500 errors or stale data.
- Connecting React Query hooks and managing cache invalidation.

❌ **Not for:**
- Pure CSS / cosmetic layout updates without data-fetching changes.
- Internal backend services or database optimizations that do not change API contracts.
- Static informational pages without API communication.

---

## The 6-Layer Verification Protocol

### Layer 1: Backend Contract & Validation Truth
Inspect the Backend source of truth:
1. **Endpoint & Route**: Verify HTTP verb (`[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]`, `[HttpPatch]`) and exact route template (e.g., `api/v1/companies/{id}/members`).
2. **Command / Query & Response DTO**: Inspect property names, types, and wrappers (`ApiResponse<T>`, `PagedResponse<T>`).
3. **FluentValidation Rules**:
   - Check every `.NotEmpty()`, `.NotNull()`, `.MinimumLength()`, `.MaximumLength()`, `.Matches()`, `.InclusiveBetween()`.
   - **Crucial Rule**: Note whether fields are required or optional depending on command state (e.g., `When(x => x.Status == Locked, () => RuleFor(x => x.Reason).NotEmpty())`).

### Layer 2: Frontend Type & DTO Synchronization (`Frontend/src/types/`)
Map Backend structures into TypeScript:
1. **Property Names**: Convert C# PascalCase to camelCase accurately. Never guess property names.
2. **Nullability & Optionality**:
   - If C# is `string?`, TypeScript must be `string | null` or `string | undefined` (or optional `field?: string`).
   - If C# has default non-null values, reflect accurately.
3. **Enums & Unions**: Match enum string representations strictly (e.g., `'Active' | 'Locked' | 'Inactive'`).

### Layer 3: API Service Layer (`Frontend/src/services/` or `Frontend/src/api/`)
Implement the Axios / fetch client call:
1. Match the exact URL path, interpolating path variables cleanly.
2. Pass query parameters as an explicit params object (e.g., `{ page, pageSize, search }`).
3. Pass payload matching the Request DTO type.
4. Extract unwrapped response data cleanly: `response.data.data` or typed `ApiResponse<T>`.

### Layer 4: React Query Hooks (`Frontend/src/hooks/queries/`)
1. **Query Keys**: Use structured, hierarchical query keys:
   ```ts
   // Good: Hierarchical and predictable
   queryKey: ['users', 'list', { role, status, page }]
   queryKey: ['companies', 'detail', companyId]
   ```
2. **Cache Invalidation**:
   - In `useMutation.onSuccess`, identify every related query that becomes stale and invalidate it explicitly:
     ```ts
     queryClient.invalidateQueries({ queryKey: ['companies', 'members', companyId] });
     queryClient.invalidateQueries({ queryKey: ['companies', 'detail', companyId] });
     ```
3. **Pagination & Placeholder Data**:
   - Preserve previous page data during pagination transitions (`placeholderData: keepPreviousData`).

### Layer 5: Error Mapping & Validation Synchronization
1. **Sync Client Validation with FluentValidation**:
   - If Backend requires min 5 characters, Frontend form / input MUST enforce min 5 characters and disable submit or show inline error.
   - If Backend requires a field conditionally, the UI label must show `*` (mandatory), NOT "(optional)".
2. **Error Message Extraction**:
   - Use standard error extractor: `getApiErrorMessage(err, fallbackMessage)`.
   - Handle backend validation dictionary errors (`errors: Record<string, string[]>`) and map them to form fields if using React Hook Form.

### Layer 6: Complete UI State Coverage (The 4 Data States)
Never ship a component that only handles the happy path. Verify all 4 states:
1. **Loading State**: Show skeleton loaders (`TableSkeleton`, card skeletons) or disabled action buttons with `isLoading` spinners.
2. **Empty State**: Show dedicated empty graphics or friendly contextual messages when arrays are empty (`data.length === 0`).
3. **Error State**: Render inline error messages, retry buttons, or toast notifications. Avoid blank screens or unhandled exceptions.
4. **Success State**: Close modals, show success toasts, reset form states, and refresh active views immediately.

---

## Verification Checklist

Before marking any API task complete, verify:

| Layer | Check | Status |
|---|---|:---:|
| **1. Backend** | Endpoint route, verb, and FluentValidation rules inspected? | [ ] |
| **2. Type** | TypeScript DTO matches Backend response & request 1-to-1? | [ ] |
| **3. Service** | Axios service uses correct HTTP verb, route, and payload? | [ ] |
| **4. Query** | React Query key structured properly and mutations invalidate stale caches? | [ ] |
| **5. Validation** | Client-side validation matches FluentValidation constraints (no surprise 400s)? | [ ] |
| **6. UI States** | All 4 states (Loading, Empty, Error, Success) visibly handled? | [ ] |
| **7. Quality** | `tsc -b` passes and ESLint has zero errors/warnings? | [ ] |
