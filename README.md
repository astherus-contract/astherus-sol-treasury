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

# 不重新启动本地节点
anchor test --skip-local-validator
anchor keys sync

solana balance

program id
8vDBbPQYPX3Q6CKKsdFkhNv4TtGDk3fBwkT3LsdukbSv


solana transfer --from /Users/user/.config/solana/id.json 3Tw6dkrzSJx66jwX4evf9GoNXvnVv8dbMk2tjH9GsA8K 2 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer /Users/user/.config/solana/id.json


solana program extend B3QEkbi6b6AAvXgUqpeWXBExVKYFEfU9psDqRdSgD76W 10000


solana program set-upgrade-authority


solana transfer --from /Users/user/.config/solana/id.json 31qHCx5zjuzB9ByW6Tnno9neHZeyQo6DTqLEMShHyjrj 2 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer /Users/user/.config/solana/id.json


https://faucet.solana.com/
https://solfaucet.com/
https://faucet.quicknode.com/solana
