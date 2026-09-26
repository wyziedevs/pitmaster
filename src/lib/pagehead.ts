// a page's title row sticks just under the site header. its height is
// published as --title (next to the header's --head) so #anchor jumps and
// other sticky panels clear both.
let owner: HTMLElement | null = null;

export function pagehead(node: HTMLElement) {
  const root = document.documentElement;
  node.classList.add("pagehead");
  owner = node;
  const publish = () => {
    if (owner === node) root.style.setProperty("--title", `${node.offsetHeight}px`);
  };
  publish();
  // it grows when the title row wraps on a narrow screen
  const ro = new ResizeObserver(publish);
  ro.observe(node);
  return {
    destroy() {
      ro.disconnect();
      // the next page may have mounted its title first; only clear our own
      if (owner === node) {
        owner = null;
        root.style.removeProperty("--title");
      }
    },
  };
}
