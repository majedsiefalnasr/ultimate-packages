import { scrollLockRegistry } from "@ultimate/uix-utils/scroll-lock";

// Thin Vue wrapper calling @ultimate/uix-utils/scroll-lock's shared
// scrollLockRegistry directly — vue-core does not own this Set (spec §16,
// §28). Not a react-core dependency.
export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
} {
  return {
    register(id) {
      scrollLockRegistry.register(id);
    },
    unregister(id) {
      scrollLockRegistry.unregister(id);
    },
  };
}
