# cloud-sol-treasury
## 1.准备环境
### https://docs.solanalabs.com/cli/install
### https://www.anchor-lang.com/docs/installation
### https://docs.solanalabs.com/cli/usage
### git clone cloud-sol-treasury
### yarn install
### solana config set --url https://api.mainnet-beta.solana.com

## 2.合约部署
### 删除 ./target 文件夹
### anchor build
### anchor keys sync
### anchor build
### solana program deploy <PROGRAM_FILEPATH>
### solana-keygen recover -o <KEYPAIR_PATH>
### solana-keygen recover -o ./bufferkey.json

### solana program deploy --buffer ./bufferkey.json ./target/deploy/cloud_sol_treasury.so --with-compute-unit-price 100000
### solana program deploy --buffer ./bufferkey.json ./target/deploy/cloud_sol_treasury.so --with-compute-unit-price 2000000
### solana program show <ACCOUNT_ADDRESS>

## 3.准备公钥
### 公共
### ./app/secret/prod/counterParty-publicKey.json
### ./app/secret/prod/operator-publicKey.json
### https://docs.chain.link/data-feeds/price-feeds/addresses?network=solana&page=1&search=USDC
### ./app/secret/prod/priceFeedProgram-publicKey.json
### USDT
### ./app/secret/prod/USDT-tokenMint-publicKey.json
### ./app/secret/prod/USDT-priceFeed-publicKey.json

## 4. 初始化
### npm run start:prodnet initialize

## 5.添加token
### npm run start:prodnet addToken USDT

## 6.执行脚本准备事项
1.执行脚本(npm run start:devnet,npm run start:prodnet)之前,把(./app/secret/apx/dev ./app/secret/apx/prod ./app/secret/astherus/dev ./app/secret/astherus/prod)拷贝到 ./app/secret/
2.把./app/secret/dev或者./app/secret/prod 中的文件（cloud_sol_treasury.so,cloud_sol_treasury-keypair.json）拷贝到./target/deploy;
cloud_sol_treasury.json 文件拷贝到./target/idl/;
cloud_sol_treasury.ts 文件拷贝到./target/types/;
3.查看 ./programs/cloud-sol-treasury/src/lib.rs/declare_id!("**********");是目前环境正确的program id
4.查看./Anchor.toml 是目前环境正确配置
[programs.devnet]
cloud_sol_treasury = "*********"

[programs.mainnet]
cloud_sol_treasury = "*********"

[provider]
#cluster = "Devnet"
cluster = "Mainnet"

wallet = "/Users/user/.config/solana/id.json"

### apx
#### dev
program id:B3QEkbi6b6AAvXgUqpeWXBExVKYFEfU9psDqRdSgD76W
#### prod
program id:B3QEkbi6b6AAvXgUqpeWXBExVKYFEfU9psDqRdSgD76W
### ae
#### dev
program id:84TXgBFKAy7xixMAjLmqbVxQ5WTYtobx64sXh19bBRhc
#### prod


## 7.合约升级
### anchor build
### anchor keys sync
### anchor build
### solana program deploy --program-id <KEYPAIR_FILEPATH> <PROGRAM_FILEPATH>
 solana program deploy --program-id ./target/deploy/cloud_sol_treasury-keypair.json ./target/deploy/cloud_sol_treasury.so
## 8.合约owner(authority)转移
### 注意 authority 要有私钥，私钥正确保管，不能是pda
### npm run start:prodnet changeAuthority XXXX(PublicKey)

## 9.合约升级的authority转移
### https://docs.squads.so/squads-v3-docs 用squads管理合约升级(https://docs.squads.so/squads-v3-docs/navigating-your-squad/developers/programs)和一些管理员的一些操作
### https://devnet.squads.so/connect-squad devnet
### 注意 authority 要有私钥，私钥正确保管，不能是pda,默认升级权限是programWallet(/Users/user/.config/solana/id.json)
### solana program deploy --upgrade-authority <UPGRADE_AUTHORITY_SIGNER> <PROGRAM_FILEPATH>

## 10.其他操作
### 提供squads需要的Data Raw 数据
### npm run start:prodnet changeTruthHolder XXXX(PublicKey)
### npm run start:prodnet changeCounterParty XXXX(PublicKey)
### npm run start:prodnet changeOperator XXXX(PublicKey)
### npm run start:prodnet changePriceFeedProgram XXXX(PublicKey)

### npm run start:prodnet updateGlobalWithdrawEnabled true
### npm run start:prodnet updateHourlyLimit 1000000    #1USDT=1e8
### npm run start:prodnet updateTokenEnable USDT true


### npm run start:prodnet getTokenClaimHistory USDT


