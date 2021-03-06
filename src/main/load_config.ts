import { SiteInfo } from "../core/site_info";
import * as path from "path";
import * as fs from "fs";
import { Config } from "../core/config";

let root_dir: null | string = null;

/**
 * 遞迴向上尋找設定檔。一旦發現，即認定發現的位置是專案根目錄，並回傳設置
 */
export function loadConfig(config_file?: string): Config {
    if (config_file) {
        root_dir = path.resolve(path.dirname(config_file), '..');
        return { file_url: config_file, sites: loadConfigFromFile(config_file) };
    }

    let cur_dir = __dirname;
    while (true) {
        if (fs.existsSync(path.join(cur_dir, 'configs'))) {
            let config_file = path.join(cur_dir, 'configs', 'config.json');
            root_dir = cur_dir;
            return { file_url: config_file, sites: loadConfigFromFile(config_file) };
        }

        let parent_dir = path.resolve(cur_dir, '..');
        if (parent_dir == cur_dir) {
            throw new Error("找不到 configs/ 資料夾！");
        } else {
            cur_dir = parent_dir;
        }
    }
}

function loadConfigFromFile(config_file: string): SiteInfo[] {
    console.log(`從 ${config_file} 讀取設定！`);
    const config_str = fs.readFileSync(config_file, { encoding: 'utf8' });
    return JSON.parse(config_str);
}

export function getPrjRoot(): string {
    if (typeof root_dir == 'string') {
        return root_dir;
    } else {
        throw new Error("找不到專案根目錄！");
    }
}
export function getConfigPath(): string {
    return joinPrjRoot('configs/');
}

export function joinPrjRoot(file: string): string {
    if (typeof root_dir == 'string') {
        if (path.isAbsolute(file)) {
            return file;
        } else {
            return path.join(root_dir, file);
        }
    } else {
        throw new Error("找不到專案根目錄！");
    }
}