import test from 'node:test';
import assert from 'node:assert/strict';
import { RITUAL_FORMULATIONS, BLOG_POSTS } from './rituals-data.ts';

test('every ritual formulation has unique ID and valid slug', () => {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const ritual of RITUAL_FORMULATIONS) {
    assert.ok(ritual.id, 'Ritual must have an id');
    assert.ok(ritual.slug, 'Ritual must have a slug');
    assert.equal(ids.has(ritual.id), false, `Duplicate id found: ${ritual.id}`);
    assert.equal(slugs.has(ritual.slug), false, `Duplicate slug found: ${ritual.slug}`);
    ids.add(ritual.id);
    slugs.add(ritual.slug);
  }
});

test('ritual formulations contain no e-commerce shop or cart properties', () => {
  for (const ritual of RITUAL_FORMULATIONS) {
    const raw = ritual as unknown as Record<string, unknown>;
    assert.equal(raw.pricePaise, undefined, 'Ritual must not have pricePaise');
    assert.equal(raw.price, undefined, 'Ritual must not have price');
    assert.equal(raw.stockCount, undefined, 'Ritual must not have stockCount');
    assert.equal(raw.inStock, undefined, 'Ritual must not have inStock');
  }
});

test('ritual formulations have rich botanical actives and components', () => {
  for (const ritual of RITUAL_FORMULATIONS) {
    assert.ok(ritual.botanicalActives.length >= 2, `Ritual ${ritual.id} must have >= 2 botanical actives`);
    assert.ok(ritual.components.length >= 1, `Ritual ${ritual.id} must have at least 1 component`);
    assert.ok(ritual.stepByStepProtocol.length >= 2, `Ritual ${ritual.id} must have >= 2 protocol steps`);
    assert.ok(ritual.imageUrl, `Ritual ${ritual.id} must have an imageUrl`);
  }
});

test('blog posts have valid structure and tags', () => {
  assert.ok(BLOG_POSTS.length >= 3, 'Must have at least 3 blog posts');
  for (const post of BLOG_POSTS) {
    assert.ok(post.slug, 'Post must have slug');
    assert.ok(post.author, 'Post must have author');
    assert.ok(post.content.length > 100, 'Post content must be descriptive');
    assert.ok(post.tags.length > 0, 'Post must have tags');
  }
});

test('category films cover all 4 flagship collections with required assets', async () => {
  const { CATEGORY_FILMS, getCategoryFilm } = await import('./video/category-films.ts');
  const expectedCategories = ['weight-management', 'gummies', 'soaps', 'bundles'];

  assert.equal(CATEGORY_FILMS.length, 4, 'Must have 4 flagship category films');

  for (const catId of expectedCategories) {
    const film = getCategoryFilm(catId);
    assert.ok(film, `Film for category ${catId} must exist`);
    assert.ok(film.headline.length > 0, `Film ${catId} must have headline`);
    assert.ok(film.description.length > 0, `Film ${catId} must have description`);
    assert.ok(film.ctaLabel.length > 0, `Film ${catId} must have ctaLabel`);
    assert.ok(film.posterUrl.length > 0, `Film ${catId} must have posterUrl`);
    assert.ok(film.videoUrl.length > 0, `Film ${catId} must have videoUrl`);
    assert.ok(['centered', 'left', 'asymmetric'].includes(film.layout), `Invalid layout: ${film.layout}`);
  }
});

