import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {

    const env = loadEnv(mode, process.cwd(), "");

    if (mode === "production" && !env.VITE_API_URL) {
        throw new Error(
            "VITE_API_URL must be configured for production builds."
        );
    }

    return {

        plugins: [react()],

        server: {

            host: true,

            proxy: {

                "/api": {

                    target: env.VITE_API_URL,

                    changeOrigin: true

                }

            }

        }

    }

})