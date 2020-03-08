import { TopicInfo } from '../core/site_info';
import { spawn } from 'child_process';
import { joinPrjRoot } from './load_config';

export async function encode(topic_info: TopicInfo, msg: string): Promise<Buffer> {
	console.log(`開始編碼：${msg}`);
	console.log('----');
	return new Promise((resolve, reject) => {
		try {
			let proto_file = joinPrjRoot(topic_info.proto_file);
			let ls = spawn('protoc', [`--encode=${topic_info.proto_type}`, proto_file]);
			ls.stdout.on('data', data => {
				resolve(data);
			});
			ls.stderr.on('data', data => {
				reject(data.toString());
			});
			ls.on('close', rc => {
				if (rc != 0) {
					reject(`protoc 異常退出，返回碼${rc}`);
				}
			});
			// NOTE: 不加幾個換行它就有毛病
			ls.stdin.write(msg + '\n\n\n');
			ls.stdin.end();
		} catch (err) {
			reject(err);
		}
	});
}

export async function decode(topic_info: TopicInfo, msg: Buffer): Promise<string> {
	console.log(`開始解碼：${msg}`);
	console.log('----');
	return new Promise((resolve, reject) => {
		try {
			let proto_file = joinPrjRoot(topic_info.proto_file);
			let ls = spawn('protoc', [`--decode=${topic_info.proto_type}`, proto_file]);
			ls.stdout.on('data', data => {
				resolve(data.toString());
			});
			ls.stderr.on('data', data => {
				reject(data.toString());
			});
			ls.on('close', rc => {
				if (rc != 0) {
					reject(`protoc 異常退出，返回碼${rc}`);
				}
			});
			ls.stdin.write(msg);
			ls.stdin.end();
		} catch (err) {
			reject(err);
		}
	});
}