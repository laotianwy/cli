/*
 * @Author: laotianwy 1695657342@qq.com
 * @Date: 2025-01-24 15:33:02
 * @LastEditors: laotianwy 1695657342@qq.com
 * @LastEditTime: 2025-01-25 00:07:21
 * @FilePath: /cli/src/utils/apiGenTs/createRemoteMockApi.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

export const createRemoteMockApi = async (
    mockApiMapData: Map<string, any>,
    apiBaseUrl: string,
    projectName: string = 'default',
) => {
    const keys = Array.from(mockApiMapData.keys());
    const sendApiData = [];
    keys.forEach((item) => {
        const getFilterApiData = mockApiMapData.get(item);
        const apis = getFilterApiData.paths;
        const pushServerData = [];
        if (apis) {
            const apiKeys = Object.keys(apis);
            apiKeys.forEach((apiUrl) => {
                const apiMethods = Object.keys(apis[apiUrl]);
                apiMethods.forEach((method) => {
                    const responseToTockStructData = {};

                    const response200Res = apis[apiUrl][method]['responses']?.['200'];
                    const response = apis[apiUrl][method]['responses']?.['200']?.content?.['application/json'];
                    if (response200Res) {
                        const item = response200Res.schema;
                        // 胜男apijson特殊操作
                        if (item?.['$ref']) {
                            const firstref = item['$ref'].split('/').filter((item) => item !== '#');
                            const firstStructData = getNestedData(getFilterApiData, firstref);
                            if (firstStructData.type === 'object') {
                                Object.keys(firstStructData?.properties ?? {}).forEach((key) => {
                                    const result = progressModel(firstStructData.properties, key, getFilterApiData);
                                    if (typeof result === 'object') {
                                        responseToTockStructData[key] = result[key];
                                    } else {
                                        responseToTockStructData[key] = result;
                                    }
                                });
                            }
                        } else if (response?.schema) {
                            if ((response.schema?.allOf ?? []).length > 0) {
                                response.schema?.allOf.forEach((item) => {
                                    if (item['$ref']) {
                                        const firstref = item['$ref'].split('/').filter((item) => item !== '#');
                                        const firstStructData = getNestedData(getFilterApiData, firstref);
                                        if (firstStructData.type === 'object') {
                                            Object.keys(firstStructData?.properties ?? {}).forEach((key) => {
                                                responseToTockStructData[key] = firstStructData.properties[key]['type'];
                                            });
                                        }
                                    }
                                    if (item['properties']) {
                                        Object.keys(item['properties']).forEach((key) => {
                                            const result = progressModel(item['properties'], key, getFilterApiData);
                                            responseToTockStructData[key] = result[key];
                                        });
                                    }
                                });
                            }
                        }
                    }
                    const mockServeData = {
                        projectName,
                        apiUrl,
                        apiMethod: method.toUpperCase(),
                        responseToTockStructData: JSON.stringify(responseToTockStructData),
                    };
                    pushServerData.push(mockServeData);
                });
            });

            sendApiData.push(...pushServerData);
        }
    });

    await fetch(`${apiBaseUrl}/mock/mock/createMockApi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            list: sendApiData,
        }),
    }).then((response) => response.json());
};

const getNestedData = (data: any, keys: string[]) => {
    let result = data;
    for (const key of keys) {
        if (result && result[key] !== undefined) {
            result = result[key];
        } else {
            return undefined; // 或者返回一个默认值
        }
    }
    return result;
};

const progressModel = (data: any, parentKey: string, getFilterApiData: any) => {
    const result = {};
    if (data[parentKey]['type'] !== 'object' && data[parentKey]['type'] !== 'array' && data[parentKey]['type']) {
        result[parentKey] = data[parentKey]['type'];
        return result[parentKey];
    }

    if (data?.[parentKey]?.['$ref'] || data[parentKey]['type'] === 'object') {
        if (data?.[parentKey]?.['$ref']) {
            if (!result[parentKey]) {
                result[parentKey] = {};
            }
            const firstref = data?.[parentKey]?.['$ref'].split('/').filter((item) => item !== '#');
            const firstStructData = getNestedData(getFilterApiData, firstref);
            Object.keys(firstStructData['properties']).forEach((key) => {
                result[parentKey][key] = progressModel(firstStructData['properties'], key, getFilterApiData);
            });
            return result;
        } else if (!data[parentKey]['properties']) {
            return result;
        }
        Object.keys(data[parentKey]['properties']).forEach((key) => {
            if (!result[parentKey]) {
                result[parentKey] = {};
            }
            result[parentKey][key] = progressModel(data[parentKey]['properties'], key, getFilterApiData);
        });
    }

    if (data[parentKey]['type'] === 'array') {
        const items = data[parentKey]['items'];
        if (items['$ref']) {
            const firstref = items['$ref'].split('/').filter((item) => item !== '#');
            // TODO:此处需要在看。因为递归原因，导致内存爆了。
            if (firstref[firstref.length - 1] === 'DeptVo') {
                return {};
            }
            if (firstref[firstref.length - 1] === 'GeneralEntity对象') {
                return {};
            }
            if (firstref[firstref.length - 1] === 'Menu对象') {
                return {};
            }
            if (firstref[firstref.length - 1] === 'PositionCategoryEntity对象') {
                return {};
            }
            // TODO:此处需要在看。因为递归原因，导致内存爆了。
            const firstStructData = getNestedData(getFilterApiData, firstref);
            Object.keys(firstStructData['properties']).forEach((key) => {
                result[key] = progressModel(firstStructData['properties'], key, getFilterApiData);
            });
        }
        return [result];
    }

    return result;
};
