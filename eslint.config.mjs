import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'out/**', 'build/**']
  },
  {
    rules: {
      'next/no-html-link-for-pages': 'off'
    }
  }
];

export default config;
