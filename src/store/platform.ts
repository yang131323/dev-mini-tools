import { computed, ref, unref } from "vue";

export enum Platform {
  PC = "pc",
  MOBILE = "mobile",
}

export function usePlatformStore() {
  const currentPlat = ref<Platform>(Platform.PC);

  function setCurrentPlat(plat: Platform) {
    currentPlat.value = plat;
  }

  function mountPlatformListener() {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return () => {};
    }

    const mql = window.matchMedia("(max-width: 768px)");

    const update = () => {
      currentPlat.value = mql.matches ? Platform.MOBILE : Platform.PC;
    };

    update();

    const handler = (e: MediaQueryListEvent) => {
      setCurrentPlat(e.matches ? Platform.MOBILE : Platform.PC);
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }

    // Safari < 14
    const legacyMql = mql as unknown as {
      addListener: (fn: (e: MediaQueryListEvent) => void) => void;
      removeListener: (fn: (e: MediaQueryListEvent) => void) => void;
    };
    legacyMql.addListener(handler);

    return () => legacyMql.removeListener(handler);
  }

  return {
    currentPlat,
    isMobile: computed(() => unref(currentPlat) === Platform.MOBILE),
    isPc: computed(() => unref(currentPlat) === Platform.PC),

    setCurrentPlat,
    mountPlatformListener,
  };
}
