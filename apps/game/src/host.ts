import { mount } from "./main";
import { createStandaloneSdk } from "./standalone-sdk";

const root = document.querySelector<HTMLDivElement>("#game-root");
if (!root) {
  throw new Error("missing #game-root element");
}
void mount(root, createStandaloneSdk("standalone"));
