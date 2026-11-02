// Use the same filtered items and navigation callback as sidebar clicks.
export function buildSidebarShortcutHandlers(items, onNavigate) {
  const handlers = {};
  const visit = (item) => {
    if (item.shortcut && item.href) {
      const combo = `alt+${item.shortcut.toLowerCase()}`;
      if (!handlers[combo]) {
        handlers[combo] = (event) => {
          event.preventDefault();
          onNavigate(item);
        };
      }
    }
    for (const child of item.subMenuItems || []) visit(child);
  };
  for (const item of items) visit(item);
  return handlers;
}
