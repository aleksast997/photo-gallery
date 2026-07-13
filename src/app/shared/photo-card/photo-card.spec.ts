import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoCard } from './photo-card';
import { Photo } from '../../core/models/photo';

const photo: Photo = {
  id: '1',
  author: 'Grace Hopper',
  width: 100,
  height: 100,
  thumbUrl: 'https://picsum.photos/id/1/500/500',
  fullUrl: 'https://picsum.photos/id/1/1200/1200',
};

describe('PhotoCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PhotoCard] }).compileComponents();
  });

  function render(favorited = false): ComponentFixture<PhotoCard> {
    const fixture = TestBed.createComponent(PhotoCard);
    fixture.componentRef.setInput('photo', photo);
    fixture.componentRef.setInput('favorited', favorited);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the thumbnail and author', () => {
    const el = render().nativeElement as HTMLElement;
    const img = el.querySelector('img')!;
    expect(img.getAttribute('src')).toBe(photo.thumbUrl);
    expect(img.getAttribute('alt')).toContain('Grace Hopper');
    expect(el.textContent).toContain('Grace Hopper');
  });

  it('shows the favorited badge only when favorited', () => {
    expect((render(false).nativeElement as HTMLElement).querySelector('.photo-card__badge')).toBeNull();
    expect((render(true).nativeElement as HTMLElement).querySelector('.photo-card__badge')).not.toBeNull();
  });

  it('emits select with its photo on click', () => {
    const fixture = render();
    let selected: Photo | undefined;
    fixture.componentInstance.select.subscribe((p) => (selected = p));
    fixture.nativeElement.querySelector('button')!.click();
    expect(selected).toEqual(photo);
  });
});