# Store FE UI compatibility layer

Reusable implementations live in `dragorbit/ui/src`. Keep importing from `@/components/ui` or the existing file paths: these wrappers delegate to `@dragorbit/ui`, so current pages do not need a bulk import rewrite.

41 UI entries use shared implementations. Simple controls/cards/tables/badges/tabs/toasts/menus are direct exports. Checkbox, file upload, date filters, settings UI and logout/upgrade confirmation use small adapters to supply the app's translations, theme state, callbacks and navigation. PageLoader supplies translated text; GlobalToastContainer reads the app's toast provider.

RichTextEditor uses `@dragorbit/ui/rich-text`, an isolated optional-DOMPurify entry. Its first render does not inject unsanitized HTML during SSR. Existing consumers already provide DOMPurify.

Three entries retain platform logic:

- `StockInDrawer`: selected store, supplier/inventory services, mutation and toast handling. Its controls and drawer are shared.
- `BulkTemplateDownloadButton`: template API, workbook/file generation and downloads. It uses the shared Button.
- `SocketNotification`: socket-event interpretation and Next navigation.

These are host adapters/features, not generic UI primitives. Moving them unchanged would introduce backend/Redux/Next dependencies into the reusable package.

Shared date/phone calculations are in `@dragorbit/core/date-range` and `/phone`. Browser viewport placement stays in `@dragorbit/ui/date-range`. Theme/translation/storage providers remain in Store FE.

Lightweight checks: typecheck, 31 component SSR cases, settings props, all UI file syntax and isolated rich-text bundling. No heavy application build was run.

Manual checks: checkbox/groups, file selection/removal/drop, calendar presets/custom ranges, phone entry, settings language/theme switching, toast lifecycle, menus/tabs, upgrade/logout dialogs and rich-text editing. Then run the normal Store FE build; existing catalog consumes shared UI too, so check its build/legacy components before release.
