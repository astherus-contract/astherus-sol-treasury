# cloud-sol-treasury
## 1.准备环境
### https://docs.solanalabs.com/cli/install
### https://www.anchor-lang.com/docs/installation
### git clone cloud-sol-treasury
### yarn install
### solana config set --url https://api.mainnet-beta.solana.com

## 2.合约部署
### anchor build
### anchor keys sync
### anchor build
### solana program deploy <PROGRAM_FILEPATH>

## 3.准备公钥
### 公共
### ./app/secret/prod/counterParty-publicKey.json
### ./app/secret/prod/operator-publicKey.json
### ./app/secret/prod/priceFeedProgram-publicKey.json
### USDT
### ./app/secret/prod/USDT-tokenMint-publicKey.json
### ./app/secret/prod/USDT-priceFeed-publicKey.json

## 4. 初始化
### npm run start:prodnet initialize

## 5.添加token
### npm run start:prodnet addToken USDT

## 6.合约升级
### anchor build
### anchor keys sync
### anchor build
### solana program deploy --program-id <KEYPAIR_FILEPATH> <PROGRAM_FILEPATH>

## 7.合约owner(authority)转移
### 注意 authority 要有私钥，私钥正确保管，不能是pda
### npm run start:prodnet changeAuthority XXXX(PublicKey)

## 8.合约升级的authority转移
### https://docs.squads.so/squads-v3-docs 用squads管理合约升级和一些管理员的一些操作
### 注意 authority 要有私钥，私钥正确保管，不能是pda
### solana program deploy --upgrade-authority <UPGRADE_AUTHORITY_SIGNER> <PROGRAM_FILEPATH>

## 9.其他操作
### 提供squads需要的Data Raw 数据
### npm run start:prodnet changeTruthHolder XXXX(PublicKey)
### npm run start:prodnet changeCounterParty XXXX(PublicKey)
### npm run start:prodnet changeOperator XXXX(PublicKey)
### npm run start:prodnet changePriceFeedProgram XXXX(PublicKey)

### npm run start:prodnet updateGlobalWithdrawEnabled true
### npm run start:prodnet updateHourlyLimit 1000000
### npm run start:prodnet updateTokenEnable USDT true
