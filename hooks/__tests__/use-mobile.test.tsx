import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

// jsdom doesn't implement matchMedia, so it needs a manual mock. We keep a
// reference to the registered "change" listener so tests can simulate a
// viewport resize the same way a real MediaQueryList would notify.
function mockMatchMedia() {
  let changeListener: (() => void) | undefined;

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: (_event: string, listener: () => void) => {
      changeListener = listener;
    },
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  return {
    triggerChange: () => changeListener?.(),
  };
}

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  it("reports desktop when the viewport is above the mobile breakpoint", () => {
    window.innerWidth = 1024;
    mockMatchMedia();

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("reports mobile when the viewport is below the mobile breakpoint", () => {
    window.innerWidth = 500;
    mockMatchMedia();

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("updates when the viewport crosses the breakpoint", () => {
    window.innerWidth = 1024;
    const { triggerChange } = mockMatchMedia();

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    window.innerWidth = 500;
    act(() => {
      triggerChange();
    });

    expect(result.current).toBe(true);
  });
});
