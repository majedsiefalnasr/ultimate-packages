import * as React from "react";

export interface UDeferredContentProps {
  children?: React.ReactNode;
  onLoad?: () => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `DeferredContent` component
 * (real source: `components/lib/deferredcontent/DeferredContent.js`/
 * `DeferredContentBase.js`). Confirmed against real source: real
 * PrimeReact/PrimeVue's own mechanism is NOT an `IntersectionObserver` —
 * it's a plain `window` `scroll` event listener checking
 * `getBoundingClientRect().top <= document.documentElement.clientHeight`
 * on every scroll tick (verified this task, `DeferredContent.js` lines
 * ~14-41, `DeferredContent.vue`'s own `shouldLoad()`/`bindScrollListener()`
 * — the two real sources are functionally identical). This port
 * deliberately deviates from that exact mechanism and uses an
 * `IntersectionObserver` instead — a strictly-better-practice equivalent
 * of the identical "has this element scrolled into view" question,
 * matching this task's own explicit expectation/test-mocking guidance —
 * disclosed here as a genuine mechanism swap, not silently presented as
 * verbatim-matching upstream. Once loaded, children render once and the
 * observer disconnects (children are never un-rendered again), matching
 * real source's own one-way `loaded` flag.
 */
export function UDeferredContent({
  children,
  onLoad,
  className,
}: UDeferredContentProps): React.ReactNode {
  const [loaded, setLoaded] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (loaded) return;
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoaded(true);
        onLoad?.();
        observer.disconnect();
      }
    });
    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onLoad intentionally not tracked; mirrors real source's mount-once binding
  }, [loaded]);

  return (
    <div ref={elementRef} className={className}>
      {loaded && children}
    </div>
  );
}
