// Shims for importing .vue files in TypeScript
// Place in src/types/vue-shims.d.ts
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}
