/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Data } from "./data/data.schema";

declare global {
  namespace App {
    interface Locals {
      data: Data;
    }
  }
}

export {};
