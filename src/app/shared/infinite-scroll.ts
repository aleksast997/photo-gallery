import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Dumb, dependency-free infinite-scroll trigger. Place it on a sentinel element
 * at the bottom of a list; it emits `scrolled` whenever that element scrolls into
 * view (with a preload margin), unless `disabled` (e.g. while loading or when the
 * stream has ended). Built on `IntersectionObserver` — no third-party libraries.
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

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !this.disabled()) {
              this.scrolled.emit();
            }
          }
        },
        { rootMargin: this.rootMargin() },
      );
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
