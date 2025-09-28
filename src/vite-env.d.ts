/// <reference types="vite/client" />

import { Import } from "lucide-react";

interface ImportMetaEnv {
    readonly VITE_OPENAI_API_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
  }