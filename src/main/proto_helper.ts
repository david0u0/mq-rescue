import { TopicInfo } from '../core/site_info';
import { spawn } from 'child_process';
import { joinPrjRoot, getPrjRoot, getConfigPath } from './load_config';
import * as ProtoBuf from 'protobufjs';

export async function encode(topic_info: TopicInfo, msg: string): Promise<Buffer> {
	console.log(`開始編碼：${msg}`);
	console.log('----');
	if (!('proto_file' in topic_info)) {
		return Buffer.from(msg);
	}
	let root = await ProtoBuf.load('');
	let proto_def = root.lookupType(topic_info.proto_type);
	if (!proto_def) {
		throw `找不到 proto 類別：${topic_info.proto_type}`;
	}
	let buff = proto_def.encode(JSON.parse(msg)).finish();
	return Buffer.from(buff.toString());
}

export function decode(topic_info: TopicInfo, msg: Buffer): Promise<string> {
	console.log(`開始解碼：${msg}`);
	console.log('----');
	return new Promise((resolve, reject) => {
		try {
			if (!('proto_file' in topic_info)) {
				resolve(msg.toString());
				return;
			}
			let proto_file = joinPrjRoot(topic_info.proto_file);
			let ls = spawn('protoc', [`--decode=${topic_info.proto_type}`, `--proto_path=${getConfigPath()}`, proto_file]);
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