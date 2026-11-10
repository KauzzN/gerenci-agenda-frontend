import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { assertProductionApiUrl, getApiOrigin } from "./src/services/apiBaseUrl.js"

export default defineConfig(({ mode }) => {

    const env = loadEnv(mode, process.cwd(), "");

    if (mode === "production") {
        if (!env.VITE_API_URL) {
            throw new Error(
                "VITE_API_URL must be configured for production builds."
            );
        }

        assertProductionApiUrl(env.VITE_API_URL);
    }

    return {

        plugins: [react()],

        server: {

            host: true,

            proxy: env.VITE_API_URL ? {

                "/api": {

                    target: getApiOrigin(env.VITE_API_URL),

                    changeOrigin: true

                }

            } : undefined

        }

    }

})