import { debounce } from "lodash-es";
import { markRaw, ref } from "vue";

export interface ViewportSize {
  width: number;
  height: number;
}

type CleanupFn = () => void;

export function useViewportStore() {
  const viewport = ref<ViewportSize>({ width: 0, height: 0 });
  const version = ref(0);

  const internalState = markRaw({
    mounted: false,
    cleanupFn: null as CleanupFn | null,
  });

  function readViewportSize(): ViewportSize {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (vv) {
      return { width: Math.round(vv.width), height: Math.round(vv.height) };
    }
    if (typeof window === "undefined") {
      return { width: 0, height: 0 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }

  function mountViewportListener() {
    if (typeof window === "undefined") return () => {};

    // 应用层只挂载一次监听；重复调用不重复注册
    if (internalState.mounted) return internalState.cleanupFn;
    internalState.mounted = true;

    function updateNow() {
      viewport.value = readViewportSize();
      version.value += 1;
    }

    const debouncedUpdate = debounce(updateNow, 300);

    // init immediately
    updateNow();

    window.addEventListener("resize", debouncedUpdate, { passive: true });
    window.addEventListener("orientationchange", debouncedUpdate, {
      passive: true,
    });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", debouncedUpdate, { passive: true });
      vv.addEventListener("scroll", debouncedUpdate, { passive: true });
    }

    internalState.cleanupFn = () => {
      debouncedUpdate.cancel();
      window.removeEventListener("resize", debouncedUpdate);
      window.removeEventListener("orientationchange", debouncedUpdate);
      if (vv) {
        vv.removeEventListener("resize", debouncedUpdate);
        vv.removeEventListener("scroll", debouncedUpdate);
      }
    };

    return () => {
      if (!internalState.mounted) return;
      internalState.cleanupFn?.();
      internalState.cleanupFn = null;
      internalState.mounted = false;
    };
  }

  return {
    viewport,
    version,
    mountViewportListener,
  };
}
