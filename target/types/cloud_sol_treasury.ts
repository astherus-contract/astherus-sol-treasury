export type CloudSolTreasury = {
  "version": "0.1.0",
  "name": "cloud_sol_treasury",
  "constants": [
    {
      "name": "TOKEN_VAULT_AUTHORITY",
      "type": "string",
      "value": "\"token_vault_authority\""
    },
    {
      "name": "SOL_VAULT",
      "type": "string",
      "value": "\"sol_vault\""
    },
    {
      "name": "ADMIN",
      "type": "string",
      "value": "\"admin\""
    },
    {
      "name": "USD_DECIMALS",
      "type": "u8",
      "value": "8"
    },
    {
      "name": "COMMA",
      "type": "string",
      "value": "\",\""
    },
    {
      "name": "CLAIM_HISTORY_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "800"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "withdrawEnabled",
          "type": "bool"
        },
        {
          "name": "hourlyLimit",
          "type": "u64"
        },
        {
          "name": "operator",
          "type": "publicKey"
        },
        {
          "name": "counterParty",
          "type": "publicKey"
        },
        {
          "name": "truthHolder",
          "type": "publicKey"
        },
        {
          "name": "priceFeedProgram",
          "type": "publicKey"
        },
        {
          "name": "removeClaimHistory",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateGlobalWithdrawEnabled",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "globalWithdrawEnabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateHourlyLimit",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "hourlyLimit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeOperator",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "operator",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeCounterParty",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "counterParty",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeTruthHolder",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "truthHolder",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeAuthority",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "authority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changePriceFeedProgram",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "priceFeedProgram",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeRemoveClaimHistory",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "removeClaimHistory",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "addSol",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
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
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        },
        {
          "name": "solVaultBump",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "fixedPrice",
          "type": "bool"
        },
        {
          "name": "priceDecimals",
          "type": "u8"
        },
        {
          "name": "tokenDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateSolEnabled",
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
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "removeSolClaimHistory",
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
          "name": "indexStr",
          "type": "string"
        }
      ]
    },
    {
      "name": "addToken",
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
          "name": "bank",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
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
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        },
        {
          "name": "tokenVaultAuthorityBump",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "fixedPrice",
          "type": "bool"
        },
        {
          "name": "priceDecimals",
          "type": "u8"
        },
        {
          "name": "tokenDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateTokenEnabled",
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
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "removeTokenClaimHistory",
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
          "name": "indexStr",
          "type": "string"
        }
      ]
    },
    {
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
    },
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
    },
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
          "type": "u32"
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
    },
    {
      "name": "withdrawSolToCounterParty",
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
    },
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
          "type": "u32"
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
    },
    {
      "name": "withdrawTokenToCounterParty",
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
          "name": "receiver",
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
  ],
  "accounts": [
    {
      "name": "empty",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "admin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "solVaultBump",
            "type": "u8"
          },
          {
            "name": "globalWithdrawEnabled",
            "type": "bool"
          },
          {
            "name": "hourlyLimit",
            "type": "u64"
          },
          {
            "name": "init",
            "type": "bool"
          },
          {
            "name": "operator",
            "type": "publicKey"
          },
          {
            "name": "truthHolder",
            "type": "publicKey"
          },
          {
            "name": "counterParty",
            "type": "publicKey"
          },
          {
            "name": "claimPerHourCursor",
            "type": "u32"
          },
          {
            "name": "claimPerHourValue",
            "type": "u64"
          },
          {
            "name": "priceFeedProgram",
            "type": "publicKey"
          },
          {
            "name": "removeClaimHistory",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "solVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idempotent",
            "type": {
              "array": [
                "u64",
                800
              ]
            }
          },
          {
            "name": "deadLine",
            "type": {
              "array": [
                "u32",
                800
              ]
            }
          },
          {
            "name": "enabled",
            "type": "bool"
          },
          {
            "name": "priceFeed",
            "type": "publicKey"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "fixedPrice",
            "type": "bool"
          },
          {
            "name": "priceDecimals",
            "type": "u8"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "bank",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idempotent",
            "type": {
              "array": [
                "u64",
                800
              ]
            }
          },
          {
            "name": "deadLine",
            "type": {
              "array": [
                "u32",
                800
              ]
            }
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultAuthorityBump",
            "type": "u8"
          },
          {
            "name": "enabled",
            "type": "bool"
          },
          {
            "name": "priceFeed",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "fixedPrice",
            "type": "bool"
          },
          {
            "name": "priceDecimals",
            "type": "u8"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializeEvent",
      "fields": [
        {
          "name": "globalWithdrawEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "hourlyLimit",
          "type": "u64",
          "index": false
        },
        {
          "name": "init",
          "type": "bool",
          "index": false
        },
        {
          "name": "operator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "counterParty",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "truthHolder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "priceFeedProgram",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "removeClaimHistory",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateWithdrawEnabledEvent",
      "fields": [
        {
          "name": "oldGlobalWithdrawEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "newGlobalWithdrawEnabled",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeOperatorEvent",
      "fields": [
        {
          "name": "oldOperator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOperator",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeCounterPartyEvent",
      "fields": [
        {
          "name": "oldCounterParty",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newCounterParty",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeTruthHolderEvent",
      "fields": [
        {
          "name": "oldTruthHolder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newTruthHolder",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeAuthorityEvent",
      "fields": [
        {
          "name": "oldAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangePriceFeedProgramEvent",
      "fields": [
        {
          "name": "oldPriceFeedProgram",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newPriceFeedProgram",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeRemoveClaimHistoryEvent",
      "fields": [
        {
          "name": "oldRemoveClaimHistory",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newRemoveClaimHistory",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateHourlyLimitEvent",
      "fields": [
        {
          "name": "oldHourlyLimit",
          "type": "u64",
          "index": false
        },
        {
          "name": "newHourlyLimit",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "AddTokenEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateTokenEnabledEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "newEnabled",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "AddSolEvent",
      "fields": [
        {
          "name": "solVault",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateSolEnabledEvent",
      "fields": [
        {
          "name": "oldEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "newEnabled",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "DepositSolEvent",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "DepositTokenEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawSolEvent",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "idempotent",
          "type": "u64",
          "index": false
        },
        {
          "name": "deadLine",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawSolToCounterPartyEvent",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawTokenEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "idempotent",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "TransferTokenToCounterPartyEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClaimPausedEvent",
      "fields": [
        {
          "name": "idempotent",
          "type": "u64",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "deadLine",
          "type": "u32",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "DepositAndWithdrawalDisabled",
      "msg": "Deposit and withdrawal function has been closed."
    },
    {
      "code": 6001,
      "name": "ZeroAmount",
      "msg": "amount must be greater than 0"
    },
    {
      "code": 6002,
      "name": "InsufficientVaultBalance",
      "msg": "vault balance is lower than withdraw amount requested"
    },
    {
      "code": 6003,
      "name": "InsufficientUserBalance",
      "msg": "User does not have enough balance to deposit"
    },
    {
      "code": 6004,
      "name": "AlreadyPassedDeadline",
      "msg": "already passed deadline"
    },
    {
      "code": 6005,
      "name": "AlreadyClaimed",
      "msg": "already claimed"
    },
    {
      "code": 6006,
      "name": "WithdrawalExceedsLimit",
      "msg": "Withdrawal exceeds limit"
    },
    {
      "code": 6007,
      "name": "AlreadyInitialized",
      "msg": "Already initialized"
    },
    {
      "code": 6008,
      "name": "WithdrawalExceedsMaximumProcessingLimit",
      "msg": "Withdrawal exceeds maximum processing limit"
    },
    {
      "code": 6009,
      "name": "InvalidSignature",
      "msg": "InvalidSignature"
    },
    {
      "code": 6010,
      "name": "SigVerificationFailed",
      "msg": "Signature verification failed."
    },
    {
      "code": 6011,
      "name": "InvalidPriceDecimals",
      "msg": "Invalid priceDecimals."
    }
  ]
};

export const IDL: CloudSolTreasury = {
  "version": "0.1.0",
  "name": "cloud_sol_treasury",
  "constants": [
    {
      "name": "TOKEN_VAULT_AUTHORITY",
      "type": "string",
      "value": "\"token_vault_authority\""
    },
    {
      "name": "SOL_VAULT",
      "type": "string",
      "value": "\"sol_vault\""
    },
    {
      "name": "ADMIN",
      "type": "string",
      "value": "\"admin\""
    },
    {
      "name": "USD_DECIMALS",
      "type": "u8",
      "value": "8"
    },
    {
      "name": "COMMA",
      "type": "string",
      "value": "\",\""
    },
    {
      "name": "CLAIM_HISTORY_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "800"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "withdrawEnabled",
          "type": "bool"
        },
        {
          "name": "hourlyLimit",
          "type": "u64"
        },
        {
          "name": "operator",
          "type": "publicKey"
        },
        {
          "name": "counterParty",
          "type": "publicKey"
        },
        {
          "name": "truthHolder",
          "type": "publicKey"
        },
        {
          "name": "priceFeedProgram",
          "type": "publicKey"
        },
        {
          "name": "removeClaimHistory",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateGlobalWithdrawEnabled",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "globalWithdrawEnabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateHourlyLimit",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "hourlyLimit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeOperator",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "operator",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeCounterParty",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "counterParty",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeTruthHolder",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "truthHolder",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeAuthority",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "authority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changePriceFeedProgram",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "priceFeedProgram",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "changeRemoveClaimHistory",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
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
          "name": "removeClaimHistory",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "addSol",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
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
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        },
        {
          "name": "solVaultBump",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "fixedPrice",
          "type": "bool"
        },
        {
          "name": "priceDecimals",
          "type": "u8"
        },
        {
          "name": "tokenDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateSolEnabled",
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
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "removeSolClaimHistory",
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
          "name": "indexStr",
          "type": "string"
        }
      ]
    },
    {
      "name": "addToken",
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
          "name": "bank",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
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
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        },
        {
          "name": "tokenVaultAuthorityBump",
          "type": "u8"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "fixedPrice",
          "type": "bool"
        },
        {
          "name": "priceDecimals",
          "type": "u8"
        },
        {
          "name": "tokenDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateTokenEnabled",
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
        }
      ],
      "args": [
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "removeTokenClaimHistory",
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
          "name": "indexStr",
          "type": "string"
        }
      ]
    },
    {
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
    },
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
    },
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
          "type": "u32"
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
    },
    {
      "name": "withdrawSolToCounterParty",
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
    },
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
          "type": "u32"
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
    },
    {
      "name": "withdrawTokenToCounterParty",
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
          "name": "receiver",
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
  ],
  "accounts": [
    {
      "name": "empty",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "admin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "solVaultBump",
            "type": "u8"
          },
          {
            "name": "globalWithdrawEnabled",
            "type": "bool"
          },
          {
            "name": "hourlyLimit",
            "type": "u64"
          },
          {
            "name": "init",
            "type": "bool"
          },
          {
            "name": "operator",
            "type": "publicKey"
          },
          {
            "name": "truthHolder",
            "type": "publicKey"
          },
          {
            "name": "counterParty",
            "type": "publicKey"
          },
          {
            "name": "claimPerHourCursor",
            "type": "u32"
          },
          {
            "name": "claimPerHourValue",
            "type": "u64"
          },
          {
            "name": "priceFeedProgram",
            "type": "publicKey"
          },
          {
            "name": "removeClaimHistory",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "solVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idempotent",
            "type": {
              "array": [
                "u64",
                800
              ]
            }
          },
          {
            "name": "deadLine",
            "type": {
              "array": [
                "u32",
                800
              ]
            }
          },
          {
            "name": "enabled",
            "type": "bool"
          },
          {
            "name": "priceFeed",
            "type": "publicKey"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "fixedPrice",
            "type": "bool"
          },
          {
            "name": "priceDecimals",
            "type": "u8"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "bank",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idempotent",
            "type": {
              "array": [
                "u64",
                800
              ]
            }
          },
          {
            "name": "deadLine",
            "type": {
              "array": [
                "u32",
                800
              ]
            }
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "tokenVaultAuthorityBump",
            "type": "u8"
          },
          {
            "name": "enabled",
            "type": "bool"
          },
          {
            "name": "priceFeed",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "fixedPrice",
            "type": "bool"
          },
          {
            "name": "priceDecimals",
            "type": "u8"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializeEvent",
      "fields": [
        {
          "name": "globalWithdrawEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "hourlyLimit",
          "type": "u64",
          "index": false
        },
        {
          "name": "init",
          "type": "bool",
          "index": false
        },
        {
          "name": "operator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "counterParty",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "truthHolder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "priceFeedProgram",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "removeClaimHistory",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateWithdrawEnabledEvent",
      "fields": [
        {
          "name": "oldGlobalWithdrawEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "newGlobalWithdrawEnabled",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeOperatorEvent",
      "fields": [
        {
          "name": "oldOperator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOperator",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeCounterPartyEvent",
      "fields": [
        {
          "name": "oldCounterParty",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newCounterParty",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeTruthHolderEvent",
      "fields": [
        {
          "name": "oldTruthHolder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newTruthHolder",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeAuthorityEvent",
      "fields": [
        {
          "name": "oldAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangePriceFeedProgramEvent",
      "fields": [
        {
          "name": "oldPriceFeedProgram",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newPriceFeedProgram",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ChangeRemoveClaimHistoryEvent",
      "fields": [
        {
          "name": "oldRemoveClaimHistory",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newRemoveClaimHistory",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateHourlyLimitEvent",
      "fields": [
        {
          "name": "oldHourlyLimit",
          "type": "u64",
          "index": false
        },
        {
          "name": "newHourlyLimit",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "AddTokenEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateTokenEnabledEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "newEnabled",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "AddSolEvent",
      "fields": [
        {
          "name": "solVault",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateSolEnabledEvent",
      "fields": [
        {
          "name": "oldEnabled",
          "type": "bool",
          "index": false
        },
        {
          "name": "newEnabled",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "DepositSolEvent",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "DepositTokenEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawSolEvent",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "idempotent",
          "type": "u64",
          "index": false
        },
        {
          "name": "deadLine",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawSolToCounterPartyEvent",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawTokenEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "idempotent",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "TransferTokenToCounterPartyEvent",
      "fields": [
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bank",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClaimPausedEvent",
      "fields": [
        {
          "name": "idempotent",
          "type": "u64",
          "index": false
        },
        {
          "name": "to",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "signer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "deadLine",
          "type": "u32",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "DepositAndWithdrawalDisabled",
      "msg": "Deposit and withdrawal function has been closed."
    },
    {
      "code": 6001,
      "name": "ZeroAmount",
      "msg": "amount must be greater than 0"
    },
    {
      "code": 6002,
      "name": "InsufficientVaultBalance",
      "msg": "vault balance is lower than withdraw amount requested"
    },
    {
      "code": 6003,
      "name": "InsufficientUserBalance",
      "msg": "User does not have enough balance to deposit"
    },
    {
      "code": 6004,
      "name": "AlreadyPassedDeadline",
      "msg": "already passed deadline"
    },
    {
      "code": 6005,
      "name": "AlreadyClaimed",
      "msg": "already claimed"
    },
    {
      "code": 6006,
      "name": "WithdrawalExceedsLimit",
      "msg": "Withdrawal exceeds limit"
    },
    {
      "code": 6007,
      "name": "AlreadyInitialized",
      "msg": "Already initialized"
    },
    {
      "code": 6008,
      "name": "WithdrawalExceedsMaximumProcessingLimit",
      "msg": "Withdrawal exceeds maximum processing limit"
    },
    {
      "code": 6009,
      "name": "InvalidSignature",
      "msg": "InvalidSignature"
    },
    {
      "code": 6010,
      "name": "SigVerificationFailed",
      "msg": "Signature verification failed."
    },
    {
      "code": 6011,
      "name": "InvalidPriceDecimals",
      "msg": "Invalid priceDecimals."
    }
  ]
};
