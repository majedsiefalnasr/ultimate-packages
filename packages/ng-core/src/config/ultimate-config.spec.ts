import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UltimateConfig } from './ultimate-config';

describe('UltimateConfig', () => {
  it('defaults unstyled to false and ripple to true', () => {
    const config = TestBed.inject(UltimateConfig);
    expect(config.unstyled()).toBe(false);
    expect(config.ripple()).toBe(true);
  });

  it('is a singleton across injections (providedIn root)', () => {
    const a = TestBed.inject(UltimateConfig);
    const b = TestBed.inject(UltimateConfig);
    expect(a).toBe(b);
  });
});
