/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAZON_ASSOCIATE_TAG: string
  readonly VITE_RAKUTEN_AFFILIATE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
