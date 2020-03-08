import { SiteInfo } from "../core/site_info";
import * as path from "path";
import * as fs from "fs";

/**
 * 遞迴向上尋找設定檔。一旦發現，即認定發現的位置是專案根目錄，並回傳 [專案根目錄, 設置]
 */
export function loadConfig(): [string, SiteInfo[]] {
    let cur_dir = __dirname;
    while (true) {
        if (fs.existsSync(path.join(cur_dir, 'configs'))) {
            let config_file = path.join(cur_dir, 'configs', 'config.json');
            console.log(`從 ${config_file} 讀取設定！`);
            return [cur_dir, require(config_file)];
        }
        cur_dir = path.resolve(cur_dir, '..');
    }
}
