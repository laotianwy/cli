/*
 * @Author: laotianwy 1695657342@qq.com
 * @Date: 2025-01-04 18:58:49
 * @LastEditors: laotianwy 1695657342@qq.com
 * @LastEditTime: 2025-01-24 20:44:30
 * @FilePath: /npm/cli/tsup.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'tsup';
import { copy } from 'fs-extra';

export default defineConfig(() => {
    const isProduction = process.env.CLI_ENV === 'production';
    return {
        entry: {
            index: 'src/index.ts',
            adapters: 'src/utils/apiGenTs/adapters/index.ts',
        },
        outDir: 'dist',
        format: ['esm'],
        minify: isProduction ? true : false,
        dts: isProduction ? true : false,
        splitting: false,
        sourcemap: isProduction ? false : true,
        clean: true,
        onSuccess: async () => {
            await copy('src/utils/apiGenTs/templatesDir/', 'dist/templatesDir');
            await copy('src/utils/apiGenTs/runProjectTemplate/', 'dist/runProjectTemplate');
            console.log('build after copy success');
        },
    };
});
