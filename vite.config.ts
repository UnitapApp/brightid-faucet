import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import viteCompression from 'vite-plugin-compression';

export default ({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return defineConfig({
		plugins: [react(), tsconfigPaths(), viteCompression()],
		publicDir: 'public',
		define: {
			'process.env': env,
		},
		build: {
			outDir: 'build',
		},
		server: {
			port: 3000,
			proxy: {
				'/api': {
					target: env['REACT_APP_API_URL'],
					changeOrigin: true,
				},
			},
		},
	});
};