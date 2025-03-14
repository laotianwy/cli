/*
 * @Author: laotianwy 1695657342@qq.com
 * @Date: 2025-01-06 23:23:14
 * @LastEditors: laotianwy 1695657342@qq.com
 * @LastEditTime: 2025-01-10 06:04:47
 * @FilePath: /cli/src/utils/apiGenTs/createRequestSwaggerServiceConfigFile.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE11
 */

import { join, resolve } from 'node:path';
import { CURRENT_FILE_PATH } from '../../config/const';
import { resolveApp } from '../common/removeDir';
import fs, { copy } from 'fs-extra';

// 创建baseUrl配置文件到项目里去
const createRequestSwaggerServiceConfigFile = async (pathPrefix: string) => {
    const path = join(pathPrefix, 'swaggerServiceConfig.ts');
    const projectConfigFilePath = resolveApp(path);
    const exist = fs.existsSync(projectConfigFilePath);
    // 如果存在那么不创建
    if (exist) {
        return;
    }
    const templateRequestPath = resolve(CURRENT_FILE_PATH, '../runProjectTemplate/swaggerServiceConfig.ts');
    await copy(templateRequestPath, projectConfigFilePath);
};

const createRequestInterceptorsConfigFile = async (pathPrefix: string) => {
    const path = join(pathPrefix, 'interceptors.ts');
    const projectConfigFilePath = resolveApp(path);
    const exist = fs.existsSync(projectConfigFilePath);
    // 如果存在那么不创建
    if (exist) {
        return;
    }

    const templateRequestPath = resolve(CURRENT_FILE_PATH, '../runProjectTemplate/interceptors.ts');
    await copy(templateRequestPath, projectConfigFilePath);
};

const createRequestIndexFileToProject = async (pathPrefix: string) => {
    const path = join(pathPrefix, 'index.ts');
    const projectConfigFilePath = resolveApp(path);
    const exist = fs.existsSync(projectConfigFilePath);
    // 如果存在那么不创建
    if (exist) {
        return;
    }
    const templateRequestPath = resolve(CURRENT_FILE_PATH, '../runProjectTemplate/index.ts');
    await copy(templateRequestPath, projectConfigFilePath);
};

const initConfigFileToProject = async (pathPrefix: string) => {
    await createRequestSwaggerServiceConfigFile(pathPrefix);
    await createRequestInterceptorsConfigFile(pathPrefix);
    await createRequestIndexFileToProject(pathPrefix);
};

export default initConfigFileToProject;
