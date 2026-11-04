import assert from 'node:assert/strict';
import { test } from 'node:test';
import { websiteFaqs } from '../content/faqs.ts';
import { allPricing, websitePricing } from '../content/pricing.ts';
import {
  breadcrumbSchema,
  faqSchema,
  localBusinessSchema,
  priceValue,
  serialiseJsonLd,
  serviceSchema,
} from './schema.ts';

test('prices are read as plain numbers', () => {
  assert.equal(priceValue('KSh 80,000'), 80000);
  assert.equal(priceValue('KSh 250,000+'), 250000);
  assert.equal(priceValue('KSh 5,000/month'), 5000);
});

test('every listed price converts to a real number', () => {
  for (const group of allPricing) {
    for (const tier of group.tiers) {
      assert.ok(priceValue(tier.oneOff) > 0, tier.oneOff);
      assert.ok(priceValue(tier.monthly) > 0, tier.monthly);
    }
  }
});

test('services carry KES offers, and a "+" price is a minimum rather than exact', () => {
  const { offers } = serviceSchema('Websites', 'Sites', websitePricing, '/websites');
  assert.equal(offers.length, 3);
  assert.equal(offers[0].priceCurrency, 'KES');
  assert.equal(offers[0].priceSpecification[0].price, 80000);
  assert.equal(offers[0].priceSpecification[1].price, 5000);
  const premium = offers[2].priceSpecification[0] as { minPrice?: number; price?: number };
  assert.equal(premium.minPrice, 250000);
  assert.equal(premium.price, undefined);
});

test('the business is in Nairobi and serves Kenya, with no invented ratings', () => {
  const business = localBusinessSchema();
  assert.equal(business.address.addressLocality, 'Nairobi');
  assert.equal(business.areaServed.name, 'Kenya');
  assert.doesNotMatch(JSON.stringify(business), /aggregateRating|review/i);
});

test('FAQ markup matches the page', () => {
  const schema = faqSchema(websiteFaqs);
  assert.equal(schema.mainEntity.length, websiteFaqs.length);
  assert.equal(schema.mainEntity[0].name, websiteFaqs[0].question);
});

test('breadcrumbs are absolute links in order', () => {
  const { itemListElement } = breadcrumbSchema('/pricing', 'Pricing');
  assert.equal(itemListElement[1].position, 2);
  assert.match(itemListElement[1].item, /^https:\/\/.+\/pricing$/);
});

test('serialised JSON-LD cannot close its script tag', () => {
  const output = serialiseJsonLd({ name: '</script><script>alert(1)</script>' });
  assert.doesNotMatch(output, /<\/script>/);
  assert.equal(JSON.parse(output).name, '</script><script>alert(1)</script>');
});
