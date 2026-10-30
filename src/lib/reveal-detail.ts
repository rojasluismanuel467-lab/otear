/**
 * With the list stacked above the detail (narrow screens), picking an item changes nothing the
 * user can see: the detail starts hundreds of pixels lower. This brings it into view, and only
 * when it is off screen, so side-by-side layouts never move. The target needs `data-reveal-target`
 * (it adds the scroll margin that clears the top bar).
 */
export function revealDetail(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (target.getBoundingClientRect().top < window.innerHeight * 0.7) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "start",
  });
}
