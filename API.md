# cloud-sol-treasury
## public key
admin
solVault
systemProgram
bank
tokenVaultAuthority
tokenVault
tokenMint
priceFeed
priceFeedProgram
associatedTokenProgram
tokenProgram
ixSysvar
programId

## fixed public key
associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

tokenProgram: TOKEN_PROGRAM_ID
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY
const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey('Sysvar1nstructions1111111111111111111111111');

## 1.deposit sol

### idl

`{
"name": "depositSol",
"accounts": [
{
"name": "signer",
"isMut": true,
"isSigner": true
},
{
"name": "admin",
"isMut": false,
"isSigner": false
},
{
"name": "solVault",
"isMut": true,
"isSigner": false
},
{
"name": "systemProgram",
"isMut": false,
"isSigner": false
}
],
"args": [
{
"name": "amount",
"type": "u64"
}
]
}`

### js

`
const deposit_sol_tx = await program.methods.depositSol(amount)
.accounts({
signer: walletKeypair.publicKey,
admin: admin,
solVault: solVault,
systemProgram: anchor.web3.SystemProgram.programId,
}).signers([walletKeypair]).rpc()
`

## 2.deposit token

### idl

`
{
"name": "depositToken",
"accounts": [
{
"name": "signer",
"isMut": false,
"isSigner": true
},
{
"name": "admin",
"isMut": false,
"isSigner": false
},
{
"name": "bank",
"isMut": false,
"isSigner": false
},
{
"name": "tokenVaultAuthority",
"isMut": false,
"isSigner": false,
"docs": [
"CHECK"
]
},
{
"name": "tokenVault",
"isMut": true,
"isSigner": false
},
{
"name": "depositor",
"isMut": true,
"isSigner": false
},
{
"name": "tokenMint",
"isMut": false,
"isSigner": false
},
{
"name": "tokenProgram",
"isMut": false,
"isSigner": false
},
{
"name": "associatedTokenProgram",
"isMut": false,
"isSigner": false
},
{
"name": "systemProgram",
"isMut": false,
"isSigner": false
}
],
"args": [
{
"name": "amount",
"type": "u64"
}
]
}
`

### js

`
let deposit_token_tx = await program.methods.depositToken(amount).accounts(
{
signer: walletKeypair.publicKey,
admin: admin,
bank: bankKeypair.publicKey,
tokenVaultAuthority: tokenVaultAuthority,
tokenVault: tokenVault,
depositor: userToken,
tokenMint: mint.publicKey,
associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
tokenProgram: TOKEN_PROGRAM_ID,
systemProgram: anchor.web3.SystemProgram.programId,
}).signers([walletKeypair]).rpc();
`

## 3.withdraw sol by signature

### idl

`
{
"name": "withdrawSolBySignature",
"accounts": [
{
"name": "signer",
"isMut": false,
"isSigner": true
},
{
"name": "admin",
"isMut": true,
"isSigner": false
},
{
"name": "solVault",
"isMut": true,
"isSigner": false
},
{
"name": "receiver",
"isMut": true,
"isSigner": false
},
{
"name": "priceFeed",
"isMut": false,
"isSigner": false
},
{
"name": "priceFeedProgram",
"isMut": false,
"isSigner": false
},
{
"name": "systemProgram",
"isMut": false,
"isSigner": false
},
{
"name": "ixSysvar",
"isMut": false,
"isSigner": false
}
],
"args": [
{
"name": "amount",
"type": "u64"
},
{
"name": "deadLine",
"type": "u64"
},
{
"name": "idempotent",
"type": "u64"
},
{
"name": "signature",
"type": {
"array": [
"u8",
64
]
}
}
]
}
`

### js

`
    let now = Date.now();
    let idempotent = new anchor.BN(now);
    let deadLine = new anchor.BN((Date.now() / 1000 + 10));
    let amount = new anchor.BN(10);
    const msg = Buffer.concat([
        Buffer.from(idempotent.toString()),
        Buffer.from(deadLine.toString()),
        Buffer.from(amount.toString()),
        admin.toBytes(),
        solVault.toBytes(),
        userKeypair.publicKey.toBytes(),
        priceFeed.toBytes(),
        priceFeedProgram.toBytes()
    ]);
`

    let messageHash = createKeccakHash("keccak256").update(msg).digest("hex");
    let messageHashUint8Array = Buffer.from(messageHash, "hex").valueOf();

    const publicKey = new PublicKey(walletKeypair.publicKey.toBase58()).toBytes();
    const privateKey = walletKeypair.secretKey;

    const signatureUint8Array = await ed.sign(messageHashUint8Array, privateKey.slice(0, 32));
    let signature = Buffer.from(signatureUint8Array).toString("hex");
    const isValid = await ed.verify(signatureUint8Array, messageHashUint8Array, publicKey);
    assert.ok(isValid)

    let withdraw_token_tx = await program.methods.withdrawSolBySignature(amount, deadLine, idempotent, Buffer.from(signatureUint8Array).toJSON().data).accounts({
        signer: walletKeypair.publicKey,
        admin: admin,
        solVault: solVault,
        receiver: userKeypair.publicKey,
        priceFeed: priceFeed,
        priceFeedProgram: priceFeedProgram,
        systemProgram: anchor.web3.SystemProgram.programId,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    }).preInstructions([Ed25519Program.createInstructionWithPublicKey({
        publicKey: publicKey,
        message: messageHashUint8Array,
        signature: signatureUint8Array,
    })]).signers([walletKeypair]).rpc()

`
## 4.withdraw token by signature

### idl

`
{
"name": "withdrawTokenBySignature",
"accounts": [
{
"name": "signer",
"isMut": false,
"isSigner": true
},
{
"name": "admin",
"isMut": true,
"isSigner": false
},
{
"name": "bank",
"isMut": true,
"isSigner": false
},
{
"name": "tokenVaultAuthority",
"isMut": false,
"isSigner": false,
"docs": [
"CHECK"
]
},
{
"name": "tokenVault",
"isMut": true,
"isSigner": false
},
{
"name": "receiver",
"isMut": true,
"isSigner": false
},
{
"name": "priceFeed",
"isMut": false,
"isSigner": false
},
{
"name": "priceFeedProgram",
"isMut": false,
"isSigner": false
},
{
"name": "tokenMint",
"isMut": false,
"isSigner": false
},
{
"name": "tokenProgram",
"isMut": false,
"isSigner": false
},
{
"name": "associatedTokenProgram",
"isMut": false,
"isSigner": false
},
{
"name": "systemProgram",
"isMut": false,
"isSigner": false
},
{
"name": "ixSysvar",
"isMut": false,
"isSigner": false
}
],
"args": [
{
"name": "amount",
"type": "u64"
},
{
"name": "deadLine",
"type": "u64"
},
{
"name": "idempotent",
"type": "u64"
},
{
"name": "signature",
"type": {
"array": [
"u8",
64
]
}
}
]
}
`

### js

`
    let now = Date.now();
    let idempotent = new anchor.BN(now);
    let deadLine = new anchor.BN((Date.now() / 1000 + 10));
    let amount = new anchor.BN(10e6);
`

    const msg = Buffer.concat([
        Buffer.from(idempotent.toString()),
        Buffer.from(deadLine.toString()),
        Buffer.from(amount.toString()),
        admin.toBytes(),
        bankKeypair.publicKey.toBytes(),
        tokenVaultAuthority.toBytes(),
        tokenVault.toBytes(),
        userToken.toBytes(),
        priceFeed.toBytes(),
        priceFeedProgram.toBytes(),
        mint.publicKey.toBytes()
    ])

    let messageHash = createKeccakHash('keccak256').update(msg).digest('hex')
    let messageHashUint8Array = Buffer.from(messageHash, 'hex').valueOf()

    const publicKey = new PublicKey(walletKeypair.publicKey.toBase58()).toBytes();
    const privateKey = walletKeypair.secretKey;

    const signatureUint8Array = await ed.sign(messageHashUint8Array, privateKey.slice(0, 32));
    let signature = Buffer.from(signatureUint8Array).toString("hex");
    const isValid = await ed.verify(signatureUint8Array, messageHashUint8Array, publicKey);
    assert.ok(isValid)

    let withdraw_token_tx = await program.methods.withdrawTokenBySignature(amount, deadLine, idempotent, Buffer.from(signatureUint8Array).toJSON().data).accounts({
        signer: walletKeypair.publicKey,
        admin: admin,
        bank: bankKeypair.publicKey,
        tokenVaultAuthority: tokenVaultAuthority,
        tokenVault: tokenVault,
        receiver: userToken,
        priceFeed: priceFeed,
        priceFeedProgram: priceFeedProgram,
        tokenMint: mint.publicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    }).preInstructions([Ed25519Program.createInstructionWithPublicKey({
        publicKey: publicKey,
        message: messageHashUint8Array,
        signature: signatureUint8Array,
    })]).signers([walletKeypair]).rpc()
`
