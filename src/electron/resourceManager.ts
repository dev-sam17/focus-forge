import osUtils from 'os-utils';
import fs from 'fs';
import os from 'os';
import { BrowserWindow } from 'electron';
import { ipcWebContentsSend } from './util.js';

const POLLING_INTERVAL = 1000; // 1 second

export function pollResources(mainWindow: BrowserWindow) {
    setInterval(async () => {
        const cpuUsage = await getCpuUsage();
        const ramUsage = getRamUsage();
        ipcWebContentsSend('statistics', mainWindow.webContents, { cpuUsage, ramUsage });
    }, POLLING_INTERVAL);
}

export function getStaticData() {
    const storageData = getStorageData();

    const cpuModel = os.cpus()[0].model; // e.g. "Intel Core i7"
    const cpuCores = os.cpus().length; // number of cores
    const cpuSpeed = os.cpus()[0].speed; // in MHz (e.g. 2400)

    // Get total RAM in MB (1 GB = 1024 MB, so we divide by 1024 twice)
    const ramTotal = Math.floor(os.totalmem() / 1024 / 1024);

    return { storageData, cpuModel, cpuCores, cpuSpeed, ramTotal };
}

function getCpuUsage(): Promise<number> {
    return new Promise(resolve => {
        osUtils.cpuUsage(resolve)
    })
}

function getRamUsage() {
    return 1 - osUtils.freememPercentage()
}

function getStorageData() {
    const stats = fs.statfsSync(process.platform === 'win32' ? 'C://' : '/');
    const total = stats.bsize * stats.blocks;
    const free = stats.bfree * stats.bsize;

    return {
        total: Math.floor(total / 1024 / 1024 / 1024), // Convert to GB
        usage: 1 - (free / total),
        free: Math.floor(free / 1024 / 1024 / 1024),
    }
}