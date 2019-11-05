**envVariables.js & ENV**

**Processing the settings imported from env file.**

In the env file. If IS_LIVETIME_ON is 1, then isLivetimeOn will be true, and
**getTimeServerTime**() will return localtime. If not, then
**getTimeServerTime**() will return a fake servertime, which can be set in env
file.

| Packages                     | Description                                               |
|------------------------------|-----------------------------------------------------------|
| dotenv                       | Loads environment variables from .env for nodejs projects | 


| Variable Name | ENV Variable Name | Description                                                     |
|---------------|-------------------|-----------------------------------------------------------------|
| symbolNumber                 | SYMBOLNUMBER                     | Testing only. Select symbol to work with                        |
| backendAddrChoice            | BACKENDADDRCHOICE                | Select the EOA for backend server to use                        |
| isToDeploy                   | IS_TO_DEPLOY                     | Testing only. Select to deploy or to check smart contracts      |
| assetbookAmount              | ASSETBOOKAMOUNT                  | Testing only. Select amount of assetbook addresses to work with |
| loglevel                     | LOGLEVEL| Select the log level to show           |
| crowdfundingScenario         | CROWDFUNDING_SCENARIO            | Select the crowdfunding scenario       |
| SERVER_HOST                  | SERVER_HOST                      | Backend server host IP                 |
| SERVER_PORT                  | SERVER_PORT                      | Backend server port                    |
| SERVER_PROTOCOL              | SERVER_PROTOCOL                  | Backend server URL protocol            |
| DB_host                      | DB_HOST | Database host IP                       |
| DB_port                      | DB_PORT | Database port |
| DB_user                      | DB_USER | Database user |
| DB_password                  | DB_PASS | Database password                      |
| DB_name                      | DB_NAME | Database name |
| blockchainChoice             | BLOCKCHAIN_CHOICE                | Select the blockchain to work with     |
| isLivetimeOn                 | IS_LIVETIME_ON                   | Select to use local machine time or a fake server time          |
| fakeServertime               | SERVERTIME                       | See isLivetimeOn                       |
| timeserverMode               | TIMESERVER_MODE                  | Time server mode for triggering frequency                       |
| timeserverTimeInverval       | TIMESERVER_TIME_INTERVAL         | The time interval between time server triggering                |
| is_addAssetbooksIntoCFC      | IS_ADDASSETBOOKS_INTO_CFC        | Decide if to run this function         |
| is_makeOrdersExpiredCFED     | IS_MAKEORDERS_EXPIRED_CFED       | Decide if to run this function         |
| is_updateExpiredOrders       | IS_UPDATE_EXPIRED_ORDERS         | Decide if to run this function         |
| is_updateFundingStateFromDB  | IS_UPDATE_FUNDING_STATE_FROM_DB  | Decide if to run this function         |
| is_updateTokenStateFromDB    | IS_UPDATE_TOKEN_STATE_FROM_DB    | Decide if to run this function         |
| is_calculateLastPeriodProfit | IS_CALCULATE_LAST_PERIOD_PROFIT  | Decide if to run this function         |

**More ENV variables not used inside envVariables.js**

| ENV Variable Name          | Description                               |
|----------------------------|-------------------------------------------|
| JWT_PRIVATEKEY             | Used to sign for producing JWT tokens     |
| NODE_ENV                   | ?                                         |
| EMAIL_USER                 | Email account to send emails              |
| EMAIL_PASS                 | Email account password                    |
| HELIUM_ADMIN               | Helium contract management EOA            |
| HELIUM_ADMIN_PRIVATEKEY    | The private key of above EOA              |
| HELIUM_CHAIRMAN            | Helium contract management EOA            |
| HELIUM_DIRECTOR            | Helium contract management EOA            |
| HELIUM_MANAGER             | Helium contract management EOA            |
| HELIUM_OWNER               | Helium contract management EOA            |
| HELIUMCONTRACTADDR         | Deployed Helium contract address          |
| REGISTRYCONTRACTADDR       | Deployed Registry contract address        |
| PRODUCTMANAGERCONTRACTADDR | Deployed Product Manager contract address |
