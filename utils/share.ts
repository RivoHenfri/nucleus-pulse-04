// Where a shared message points people back to.
//
// The link has to survive being pasted into WhatsApp by one person and opened
// by another on a different phone, so it is the page's own address with the
// query string dropped: a room key or a rehearsal `?scene=` belongs to the run
// it came from and would send the next person somewhere they should not start.

export const shareUrl = (): string => {
  try {
    return `${window.location.origin}${window.location.pathname}`;
  } catch {
    return '';
  }
};
