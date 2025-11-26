#!/usr/bin/env node

/**
 * 简化的API测试，用于调试具体问题
 */

import axios from 'axios';

const API_BASE_URL = 'https://apipro.maynor1024.live/';
const API_KEY = 'sk-HfmbZPrN2kWSJd0AJrS85xNBNeP0KKE45S0IjkrWAWavdBz8';

// 创建API客户端
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    timeout: 30000
});

console.log('🔍 开始API调试测试...\n');

// 测试1: 角色创建API
async function testCharacterCreation() {
    console.log('1️⃣ 测试角色创建API...');

    try {
        const requestData = {
            url: 'https://filesystem.site/cdn/20251030/javYrU4etHVFDqg8by7mViTWHlMOZy.mp4',
            timestamps: '1,3'
        };

        console.log('请求数据:', JSON.stringify(requestData, null, 2));

        const response = await api.post('/sora/v1/characters', requestData);

        console.log('✅ 角色创建成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.log('❌ 角色创建失败!');
        console.log('错误状态:', error.response?.status);
        console.log('错误数据:', JSON.stringify(error.response?.data, null, 2));
        console.log('错误消息:', error.message);
        return null;
    }
}

// 测试2: 带角色视频生成API
async function testVideoWithCharacter() {
    console.log('\n2️⃣ 测试带角色视频生成API...');

    try {
        const requestData = {
            model: 'sora-2',
            prompt: 'A cute character dancing in a beautiful garden with colorful flowers',
            size: 'large',
            images: [],
            orientation: 'landscape',
            duration: 10,
            character_url: 'https://filesystem.site/cdn/20251030/javYrU4etHVFDqg8by7mViTWHlMOZy.mp4',
            character_timestamps: '1,3'
        };

        console.log('请求数据:', JSON.stringify(requestData, null, 2));

        const response = await api.post('/v1/video/create', requestData);

        console.log('✅ 视频生成任务创建成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.log('❌ 视��生成任务创建失败!');
        console.log('错误状态:', error.response?.status);
        console.log('错误数据:', JSON.stringify(error.response?.data, null, 2));
        console.log('错误消息:', error.message);
        return null;
    }
}

// 测试3: 任务状态查询API
async function testTaskStatus(taskId) {
    if (!taskId) {
        console.log('\n3️⃣ 跳过任务状态查询（没有任务ID）');
        return;
    }

    console.log(`\n3️⃣ 测试任务状态查询API... (任务ID: ${taskId})`);

    try {
        const response = await api.get(`/v1/videos/${taskId}`);

        console.log('✅ 任务状态查询成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.log('❌ 任务状态查询失败!');
        console.log('错误状态:', error.response?.status);
        console.log('错误数据:', JSON.stringify(error.response?.data, null, 2));
        console.log('错误消息:', error.message);
        return null;
    }
}

// 运行测试
async function runTests() {
    const characterResult = await testCharacterCreation();
    const videoResult = await testVideoWithCharacter();

    if (videoResult && videoResult.id) {
        await testTaskStatus(videoResult.id);
    }

    console.log('\n🎯 API调试测试完成');
    console.log('请根据以上结果分析API接口是否正常工作');
}

runTests().catch(error => {
    console.error('测试执行出错:', error.message);
    process.exit(1);
});