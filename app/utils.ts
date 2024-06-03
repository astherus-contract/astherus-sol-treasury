import fs from 'mz/fs';
import path from 'path';
import {Keypair, PublicKey} from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import * as borsh from "borsh";

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
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString.trim()));
    let keypair = Keypair.fromSecretKey(secretKey);

    filePath = path.resolve(
        './app/secret', env, type + '-publicKey.json'
    )
    fs.writeFileSync(filePath, keypair.publicKey.toBase58());

    return keypair
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
        fs.writeFileSync(filePath, '[' + keypair.secretKey + ']');

        filePath = path.resolve(
            './app/secret', env, type + '-publicKey.json'
        )
        fs.writeFileSync(filePath, keypair.publicKey.toBase58());

        return keypair;
    }
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString.trim()));
    let keypair = Keypair.fromSecretKey(secretKey);

    filePath = path.resolve(
        './app/secret', env, type + '-publicKey.json'
    )
    fs.writeFileSync(filePath, keypair.publicKey.toBase58());

    return keypair
}

export function createKeypair(
    env: string,
    type: string,
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-keypair.json'
    )
    const keypair = anchor.web3.Keypair.generate();
    fs.writeFileSync(filePath, '[' + keypair.secretKey + ']');

    filePath = path.resolve(
        './app/secret', env, type + '-publicKey.json'
    )
    fs.writeFileSync(filePath, keypair.publicKey.toBase58());

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
    fs.writeFileSync(filePath, '[' + keypair.secretKey + ']');

    filePath = path.resolve(
        './app/secret', env, type + '-publicKey.json'
    )
    fs.writeFileSync(filePath, keypair.publicKey.toBase58());
}


export function savePublicKey(
    env: string,
    type: string,
    publicKey: PublicKey
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-publicKey.json'
    )
    fs.writeFileSync(filePath, publicKey.toBase58());
}

export function loadPublicKey(
    env: string,
    type: string
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-publicKey.json'
    )
    let publicKeyString = ''
    try {
        publicKeyString = fs.readFileSync(filePath, {encoding: 'utf8'});
    } catch (e) {
        if (e.toString().indexOf('no such file or directory') >= 0) {
            return null;
        }
        throw e;
    }
    return new PublicKey(publicKeyString.trim())
}

export function getOrCreatePublicKey(
    env: string,
    type: string,
) {
    let filePath = path.resolve(
        './app/secret', env, type + '-publicKey.json'
    )

    let publicKeyString = ''
    try {
        publicKeyString = fs.readFileSync(filePath, {encoding: 'utf8'});
    } catch (e) {
        if (e.toString().indexOf('no such file or directory') < 0) {
            throw e;
        }
    }

    if (publicKeyString == '') {
        const keypair = anchor.web3.Keypair.generate();
        filePath = path.resolve(
            './app/secret', env, type + '-publicKey.json'
        )
        fs.writeFileSync(filePath, keypair.publicKey.toBase58());

        return keypair.publicKey;
    }

    return new PublicKey(publicKeyString.trim())
}

export function printAdminInfo(
    data: Uint8Array) {
    const uint32Array = Uint32Array.of(800);
    const uint8Array = new Uint8Array(uint32Array.buffer);
    const schema = {struct: {idempotent: {array: {type: 'u64'}}, deadLine: {array: {type: 'u32'}}}};
    const decoded = borsh.deserialize(schema, Buffer.concat([uint8Array, new Uint8Array(data.slice(8, 8 + 8 * 800)), uint8Array, new Uint8Array(data.slice(8 + 8 * 800, 8 + 8 * 800 + 4 * 800))]));
    // for (let i = 0; i < 800; i++) {
    //     if (decoded["idempotent"][i] != 0 || decoded["deadLine"][i] != 0) {
    //         console.log(`idempotent:${decoded["idempotent"][i]},deadLine:${decoded["deadLine"][i]}`)
    //     }
    // }
    console.log('')

}

export function printSolVaultInfo(
    data: Uint8Array) {
    const uint32Array = Uint32Array.of(800);
    const uint8Array = new Uint8Array(uint32Array.buffer);
    const schema = {struct: {
            idempotent: {array: {type: 'u64'}},
            deadLine: {array: {type: 'u32'}},
            enabled:'bool',
            // priceFeed:'pubkey',
            // admin:'pubkey',
            price:'u64',
            fixedPrice:'bool',
            priceDecimals:'u8',
            tokenDecimals:'u8',
        }};
    const decoded = borsh.deserialize(schema, Buffer.concat([
        uint8Array,
        new Uint8Array(data.slice(8, 8 + 8 * 800)),
        uint8Array,
        new Uint8Array(data.slice(8 + 8 * 800, 8 + 8 * 800 + 4 * 800)),
        new Uint8Array(data.slice(8+8 * 800 + 4 * 800, 8 + 8 * 800 + 4 * 800+1)),
        new Uint8Array(data.slice(8+8 * 800 + 4 * 800+1+32+32, 8+8 * 800 + 4 * 800+1+32+32+8+1+1+1+1)),

        //
    //
    ]));
    // for (let i = 0; i < 800; i++) {
    //     if (decoded["idempotent"][i] != 0 || decoded["deadLine"][i] != 0) {
    //         console.log(`idempotent:${decoded["idempotent"][i]},deadLine:${decoded["deadLine"][i]}`)
    //     }
    // }
    console.log(decoded);
console.log(data.length)



}

