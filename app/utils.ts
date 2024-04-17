/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import fs from 'mz/fs';
import path from 'path';
import {Keypair} from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";

export function getKeypair(
    env: string,
    type: string,
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-keypair.json'
    )

    let secretKeyString = ''
    try {
        secretKeyString = fs.readFileSync(filePath, {encoding: 'utf8'});
    } catch (e) {
        if (e.toString().indexOf('no such file or directory') >= 0) {
            return null;
        }
        throw e;
    }

    const secretKey = Buffer.from(secretKeyString, 'hex');
    return Keypair.fromSecretKey(secretKey);
}

export function getOrCreateKeypair(
    env: string,
    type: string,
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-keypair.json'
    )

    let secretKeyString = ''
    try {
        secretKeyString = fs.readFileSync(filePath, {encoding: 'utf8'});
    } catch (e) {
        if (e.toString().indexOf('no such file or directory') < 0) {
            throw e;
        }
    }

    if (secretKeyString == '') {
        const keypair = anchor.web3.Keypair.generate();
        fs.writeFileSync(filePath, Buffer.from(keypair.secretKey).toString('hex'));
        return keypair;
    }
    const secretKey = Buffer.from(secretKeyString, 'hex');
    return Keypair.fromSecretKey(secretKey);
}

export function createKeypair(
    env: string,
    type: string,
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-keypair.json'
    )
    const keypair = anchor.web3.Keypair.generate();
    fs.writeFileSync(filePath, Buffer.from(keypair.secretKey).toString('hex'));
    return keypair;
}

export function saveKeypair(
    env: string,
    type: string,
    keypair: Keypair
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-keypair.json'
    )
    fs.writeFileSync(filePath, Buffer.from(keypair.secretKey).toString('hex'));
}
