import { ScrollSmoother } from "gsap-trial/ScrollSmoother";

export let smoother: ScrollSmoother;

export function setSmootherInstance(instance: ScrollSmoother) {
  smoother = instance;
}
