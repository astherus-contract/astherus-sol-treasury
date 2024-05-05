import fs from 'mz/fs';
import path from 'path';
import {Keypair, PublicKey} from '@solana/web3.js';
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
