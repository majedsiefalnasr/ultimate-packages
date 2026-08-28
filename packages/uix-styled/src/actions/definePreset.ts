import { deepMerge } from '@ultimate/uix-utils/object';

export default function definePreset<T extends Record<string, unknown>>(...presets: T[]): T {
    return deepMerge(...presets) as T;
}
