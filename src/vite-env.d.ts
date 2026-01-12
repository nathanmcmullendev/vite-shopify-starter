/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_STORE: string
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN: string
  readonly VITE_SHOPIFY_API_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
