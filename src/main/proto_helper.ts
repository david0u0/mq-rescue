import { TopicInfo } from '../core/site_info';
import { spawn } from 'child_process';

export async function encode(topic_info: TopicInfo, msg: string): Promise<string> {
    console.log(`開始編碼：${msg}`);
    return new Promise((resolve, reject) => {
        let ls = spawn('protoc', [`--encode=${topic_info.proto_type}`, topic_info.proto_file]);
        ls.stdout.on('data', data => {
            resolve(data.toString());
        });
        ls.stderr.on('data', data => {
            reject();
        });
        ls.on('close', rc => {
            if (rc != 0) {
                reject();
            }
        });
        ls.stdin.write(msg);
        ls.stdin.end();
    });
}