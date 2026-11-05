'use client';

import type { ScriptHTMLAttributes } from 'react';

const noop = () => undefined;

/**
 * A pasted `<script async src>` where the admin put it, nothing added to the tag
 * (vande-0411 #062).
 *
 * React moves an async script to the top of <head> as a resource, away from the
 * inline part of the same snippet and out of <body> for an "end of body" one. A
 * load handler is what keeps it in place, and unlike the `itemProp=""` used
 * before, it writes nothing into the page. Handlers need a client component.
 */
export function AsyncLoaderScript(props: ScriptHTMLAttributes<HTMLScriptElement>) {
  return <script {...props} onLoad={noop} />;
}
