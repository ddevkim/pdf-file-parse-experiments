import { go } from "fxjs/es";
import { $delegate } from "fxdom/es";
import { handleHello, handlePdfFile } from "./eventHandler";

go(
  document.body,
  $delegate("change", ".pdf-upload", handlePdfFile),
  $delegate("click", ".pdf-upload", ({ currentTarget: ct }) => {
    ct.value = null;
  }),
  $delegate("click", ".hello", handleHello),
);
