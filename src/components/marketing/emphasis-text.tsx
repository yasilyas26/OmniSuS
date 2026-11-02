import { Fragment } from "react";

import { splitEmphasis } from "@/lib/emphasis";

import { Em } from "./section-heading";

/** Merender teks berpenanda `*kata*` dengan kata itu dalam serif miring. */
export function EmphasisText({ text }: { text: string }) {
  return (
    <>
      {splitEmphasis(text).map((part, index) =>
        part.emphasized ? (
          <Em key={index}>{part.text}</Em>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
