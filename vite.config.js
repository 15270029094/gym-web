import fs from "node:fs"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

const HIGHLIGHT_FROM = 'const HIGHLIGHT_COLOR = "#e19a5b";\nconst HIGHLIGHT_EMISSIVE = "#6b3d20";'
const HIGHLIGHT_TO = 'const HIGHLIGHT_COLOR = "#22c55e";\nconst HIGHLIGHT_EMISSIVE = "#15803d";'

function paintSelectionGreen(code) {
  return code.includes(HIGHLIGHT_FROM) ? code.replace(HIGHLIGHT_FROM, HIGHLIGHT_TO) : code
}

function greenSelectionHighlight() {
  return {
    name: "green-selection-highlight",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("@somakine") || !id.includes("viewer")) {
        return
      }
      const next = paintSelectionGreen(code)
      if (next !== code) {
        return next
      }
    },
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [
              {
                name: "green-selection-highlight",
                setup(build) {
                  build.onLoad({ filter: /@somakine[\\/]viewer[\\/]dist[\\/]index\.js$/ }, (args) => ({
                    contents: paintSelectionGreen(fs.readFileSync(args.path, "utf8")),
                    loader: "js"
                  }))
                }
              }
            ]
          }
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), greenSelectionHighlight()],
  server: {
    host: "127.0.0.1",
    port: 5173
  }
})
