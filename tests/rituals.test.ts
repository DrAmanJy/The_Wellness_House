import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  RITUAL_FORMULATIONS, 
  BLOG_POSTS, 
  getRitualBySlug, 
  getRitualsByCategory, 
  searchRituals, 
  getBlogPostBySlug 
} from '../lib/rituals-data';

test('Ritual Formulations: Verify non-e-commerce data structure and rich content', () => {
  assert.ok(Array.isArray(RITUAL_FORMULATIONS));
  assert.ok(RITUAL_FORMULATIONS.length >= 4, 'Should have multiple complete ritual formulations');

  for (const ritual of RITUAL_FORMULATIONS) {
    // Non-ecommerce checks: No prices, no buy buttons, no stock counts
    assert.strictEqual(
      (ritual as any).price, 
      undefined, 
      `Ritual ${ritual.id} should have no price property`
    );
    assert.strictEqual(
      (ritual as any).inStock, 
      undefined, 
      `Ritual ${ritual.id} should have no inStock property`
    );

    // Rich editorial imagery
    assert.ok(ritual.imageUrl, `Ritual ${ritual.id} must have a lead editorial imageUrl`);
    assert.ok(
      ritual.imageUrl.startsWith('http'), 
      `Ritual ${ritual.id} imageUrl must be a valid URL`
    );
    assert.ok(
      Array.isArray(ritual.galleryImages) && ritual.galleryImages.length > 0,
      `Ritual ${ritual.id} must have gallery images`
    );

    // Deep information & chronobiology science
    assert.ok(ritual.title.length > 5, 'Title should be substantial');
    assert.ok(ritual.overview.length > 50, 'Overview must be deeply informative');
    assert.ok(ritual.theScience.length > 50, 'theScience must provide scientific grounding');
    assert.ok(ritual.circadianTime.length > 0, 'circadianTime must specify optimal chronobiology phase');
    assert.ok(ritual.botanicalActives.length >= 2, 'Must specify at least 2 active botanicals with biomarkers');

    for (const active of ritual.botanicalActives) {
      assert.ok(active.name, 'Active must have a name');
      assert.ok(active.scientificName, 'Active must have a scientific name');
      assert.ok(active.activeCompound, 'Active must have an active compound/marker');
      assert.ok(active.sourceRegion, 'Active must specify source terroir region');
      assert.ok(active.therapeuticFunction, 'Active must have a therapeutic function');
    }
  }
});

test('Ritual Query Helpers: getRitualBySlug', () => {
  const metabolic = getRitualBySlug('metabolic-balance-protocol');
  assert.ok(metabolic, 'Should find metabolic-balance-protocol');
  assert.strictEqual(metabolic?.slug, 'metabolic-balance-protocol');
  assert.strictEqual(metabolic?.category, 'metabolic-balance');

  const nonExistent = getRitualBySlug('non-existent-ritual-xyz');
  assert.strictEqual(nonExistent, undefined);
});

test('Ritual Query Helpers: getRitualsByCategory', () => {
  const all = getRitualsByCategory('all');
  assert.strictEqual(all.length, RITUAL_FORMULATIONS.length);

  const evening = getRitualsByCategory('evening-restoration');
  assert.ok(evening.length >= 1);
  assert.ok(evening.every(r => r.category === 'evening-restoration'));
});

test('Ritual Query Helpers: searchRituals', () => {
  const egcgSearch = searchRituals('EGCG');
  assert.ok(egcgSearch.length >= 1, 'Should find rituals containing EGCG active marker');

  const emptySearch = searchRituals('');
  assert.strictEqual(emptySearch.length, RITUAL_FORMULATIONS.length);
});

test('Journal Blog Posts: Rich editorial essays & chronobiology guides', () => {
  assert.ok(BLOG_POSTS.length >= 3, 'Should have multiple journal essays');
  for (const post of BLOG_POSTS) {
    assert.ok(post.slug, 'Post must have a slug');
    assert.ok(post.title, 'Post must have a title');
    assert.ok(post.content.length > 200, 'Content must be an extensive essay');
    assert.ok(post.author, 'Must attribute knowledgeable author');
  }

  const post = getBlogPostBySlug('circadian-chronobiology-and-vitality');
  assert.ok(post, 'Should find chronobiology guide post');
});
