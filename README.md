# cloud-sol-treasury
cloud-sol-treasury

1.https://www.anchor-lang.com/docs/installation

2.yarn install

3.anchor test

# 切换网络
solana config set -url devnet

solana config set -url localhost

# 启动本地节点
solana-test-validator

# 不重新启动本地节点
anchor test --skip-local-validator