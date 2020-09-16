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
	let root = new ProtoBuf.Root();
	root.resolvePath = (_, target) => {
		return ProtoBuf.util.path.resolve(getConfigPath(), target);
	};
	await root.load(joinPrjRoot(topic_info.proto_file));
	let proto_def = root.lookupType(topic_info.proto_type);
	let buff = proto_def.encode(JSON.parse(msg)).finish();
	return Buffer.from(buff);
}

export async function decode(topic_info: TopicInfo, msg: Buffer): Promise<string> {
	console.log(`開始解碼：${msg}`);
	console.log('----');
	if (!('proto_file' in topic_info)) {
		return msg.toString();
	}
	let root = new ProtoBuf.Root();
	root.resolvePath = (_, target) => {
		return ProtoBuf.util.path.resolve(getConfigPath(), target);
	};
	await root.load(joinPrjRoot(topic_info.proto_file));
	let proto_def = root.lookupType(topic_info.proto_type);
	let buff = proto_def.decode(msg);
	return JSON.stringify(buff.toJSON());
}