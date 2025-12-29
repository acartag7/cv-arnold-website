import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts"
    ]
  },
  {
    // Temporarily disable new React 19 strict rules that require significant refactoring
    // TODO: Address these in a follow-up PR to adopt React 19 patterns fully
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off"
    }
  }
];

export default eslintConfig;
