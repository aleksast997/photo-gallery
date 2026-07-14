import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Dumb, dependency-free infinite-scroll trigger. Place it on a sentinel element
 * at the bottom of a list; it emits `scrolled` whenever that element is in view
 * (with a preload margin), unless `disabled` (e.g. while loading or once the
 * stream has ended). Built on `IntersectionObserver` — no third-party libraries.
 *
 * The observer only reports enter/leave transitions, so an effect re-checks after
 * each load: while the sentinel stays in view and loading is enabled it keeps
 * emitting, which "fills" the viewport when a page is too short to push the
 * sentinel off-screen. It stops once the sentinel scrolls away or `disabled`
 * goes true (end/error).
 */
@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScroll {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly disabled = input(false);
  readonly rootMargin = input('200px');
  readonly scrolled = output<void>();

  private readonly intersecting = signal(false);

  constructor() {
    effect(() => {
      if (this.intersecting() && !this.disabled()) {
        this.scrolled.emit();
      }
    });

    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            this.intersecting.set(entry.isIntersecting);
          }
        },
        { rootMargin: this.rootMargin() },
      );
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}