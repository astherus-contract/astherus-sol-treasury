# cloud-sol-treasury
cloud-sol-treasury

1.https://www.anchor-lang.com/docs/installation

2.yarn install

3.anchor test

# 切换网络
solana config set -url devnet
solana config set --url https://api.devnet.solana.com



solana config set -url localhost
solana config set --url http://127.0.0.1:8899




# 启动本地节点
solana-test-validator
solana-test-validator -r
# 不重新启动本地节点
anchor test --skip-local-validator
anchor keys sync

solana balance

program id
8vDBbPQYPX3Q6CKKsdFkhNv4TtGDk3fBwkT3LsdukbSv


solana transfer --from /Users/user/.config/solana/id.json 3Tw6dkrzSJx66jwX4evf9GoNXvnVv8dbMk2tjH9GsA8K 2 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer /Users/user/.config/solana/id.json

# Error: Deploying program failed: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: account data too small for instruction
solana program extend B3QEkbi6b6AAvXgUqpeWXBExVKYFEfU9psDqRdSgD76W 10000


solana program set-upgrade-authority


solana transfer --from /Users/user/.config/solana/id.json FvpYdqXHmxyQXM48thawwo1VmnKdT55cJyU4iwWK76VB 1 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer /Users/user/.config/solana/id.json

spl-token accounts

spl-token balance AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM

#spl-token transfer mint account amount token account
spl-token transfer 8J531oLS35qshhirYUDvWfWGKkF6GgLTbtz1hknpDFaK 50 12YdYAkQM8E4DwGK3hoHborRXRV81Prg5nj15d1XBWcn

spl-token transfer HJ5DsnJaPi6HfPC2rA9xmaFGdsCe2acMhbxeeJB8nBjK 50 4gvyqciCwRdcKEXbNTkKJ1yPDkXM1c1HdRttyGr4AMf2


# spl-token transfer --fund-recipient mint account amount to token account
spl-token transfer --fund-recipient AseV6ZrBKS49b7BqHqW2FS349hA3eirL8pPJbReA6HGS 100 4gvyqciCwRdcKEXbNTkKJ1yPDkXM1c1HdRttyGr4AMf2


spl-token transfer --fund-recipient  H6PQUjb8CqXzGJy92PBJ2itwWHgVR3RJyQhsEG1yVAHD 100 EVoqKxpMpiDD4D6uRL9vWEsaxB7xchUnXLU2SuFnrCRG
spl-token transfer --fund-recipient  H6PQUjb8CqXzGJy92PBJ2itwWHgVR3RJyQhsEG1yVAHD 100 6xxWuMR82pw2U6akFEczzzrbpMocq636T6trJMXBEsdQ


https://faucet.solana.com/
https://solfaucet.com/
https://faucet.quicknode.com/solana
