import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Header } from './header';
import { ThemeMode } from '../../core/models/theme';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(count = 0, theme: ThemeMode = 'light'): ComponentFixture<Header> {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('favoritesCount', count);
    fixture.componentRef.setInput('theme', theme);
    fixture.detectChanges();
    return fixture;
  }

  it('renders Photos and Favorites navigation links', () => {
    const el = render().nativeElement as HTMLElement;
    const linkText = Array.from(el.querySelectorAll('a')).map((a) => a.textContent ?? '');
    expect(linkText.some((t) => t.includes('Photos'))).toBe(true);
    expect(linkText.some((t) => t.includes('Favorites'))).toBe(true);
  });

  it('shows the favorites count when greater than zero', () => {
    const el = render(3).nativeElement as HTMLElement;
    expect(el.textContent).toContain('3');
  });

  it('emits toggleTheme when the toggle button is clicked', () => {
    const fixture = render();
    let emitted = false;
    fixture.componentInstance.toggleTheme.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('button')!.click();
    expect(emitted).toBe(true);
  });

  it('reflects the active theme in the toggle control', () => {
    const el = render(0, 'dark').nativeElement as HTMLElement;
    const button = el.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toContain('light');
    expect(button.textContent).toContain('light_mode');
  });
});