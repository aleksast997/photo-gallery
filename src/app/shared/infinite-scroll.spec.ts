import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { InfiniteScroll } from './infinite-scroll';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  disconnected = false;
  private readonly elements: Element[] = [];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.elements.push(el);
  }
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  emit(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  imports: [InfiniteScroll],
  template: `<div appInfiniteScroll [disabled]="disabled()" (scrolled)="hits = hits + 1"></div>`,
})
class HostComponent {
  readonly disabled = signal(false);
  hits = 0;
}

describe('InfiniteScroll', () => {
  let original: typeof IntersectionObserver;

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    original = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = original;
  });

  async function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(MockIntersectionObserver.instances).toHaveLength(1);
    return fixture;
  }

  it('emits scrolled when the sentinel intersects', async () => {
    const fixture = await setup();
    MockIntersectionObserver.instances[0].emit(true);
    expect(fixture.componentInstance.hits).toBe(1);
  });

  it('does not emit while disabled', async () => {
    const fixture = await setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    MockIntersectionObserver.instances[0].emit(true);
    expect(fixture.componentInstance.hits).toBe(0);
  });

  it('does not emit when the sentinel is not intersecting', async () => {
    const fixture = await setup();
    MockIntersectionObserver.instances[0].emit(false);
    expect(fixture.componentInstance.hits).toBe(0);
  });

  it('disconnects the observer on destroy', async () => {
    const fixture = await setup();
    fixture.destroy();
    expect(MockIntersectionObserver.instances[0].disconnected).toBe(true);
  });
});
