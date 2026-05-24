import { ScrollSmoother } from "gsap/ScrollSmoother";

export let smoother: ScrollSmoother;

export function setSmootherInstance(instance: ScrollSmoother) {
  smoother = instance;
}
