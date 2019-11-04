**zsetupData.js**

**Setup data**

| Packages                  | Descriptions                         |
|---------------------------|--------------------------------------|
| winston                   | A logger for just about everything   |
| winston-daily-rotate-file | Save daily log file into /log folder |

**Imported functions from /timeserver/envVariables.js**

| Imported variables | Descriptions                                                                                                                                  |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| loglevel           | The level of logs to show in the console, e.g. error, warn, info, verbose, debug, but we use 1\~5 in the env file to specify which one to use |

**Regulatory Restrictions in Taiwan**

authLevel & STO investor classification on purchase amount and holding balance
restrictions in case of public offering(PO) and private placement(PP), for each
symbol;

Note: currency is in NTD

| Compliance Level | Person Level                                    | Max Amount to buy in PO | Max Balance to own in PO | Max Amount to buy in PP | Max Balance to own in PP |
|------------------|-------------------------------------------------|-------------------------|--------------------------|-------------------------|--------------------------|
| 1                | Natural Person                                  | 0                       | 0                        | unlimited               | unlimited                |
| 2                | Professional institutional investor             | unlimited               | unlimited                | unlimited               | unlimited                |
| 3                | High Networth investment legal person           | unlimited               | unlimited                | unlimited               | unlimited                |
| 4                | Legal person or fund of a professional investor | unlimited               | unlimited                | unlimited               | unlimited                |
| 5                | Natural person of Professional investor         | 100,000                 | 100,000                  | unlimited               | unlimited                |

**Functions defined within zsetupData.js**

| Function Name   | Parameters                                    | Description                                                                      |
|-----------------|-----------------------------------------------|----------------------------------------------------------------------------------|
| checkCompliance | authLevel, balance, orderPayment, fundingType | Returns a boolean value to see if the given arguments are under legal compliance |

**Variables defined within zsetupData.js**

| Function Name   | Compiled contracts      | Description                       |
|-----------------|-------------------------|-----------------------------------|
| Helium          | Helium.json             | Compiled Helium contract          |
| AssetBook       | AssetBook.json          | Compiled AssetBook contract       |
| Registry        | Registry.json           | Compiled Registry contract        |
| TokenController | TokenController.json    | Compiled TokenController contract |
| HCAT721         | HCAT721_AssetToken.json | Compiled HCAT721 contract         |
| CrowdFunding    | CrowdFunding.json       | Compiled CrowdFunding contract    |
| IncomeManager   | IncomeManagerCtrt.json  | Compiled IncomeManager contract   |
| ProductManager  | ProductManager.json     | Compiled ProductManager contract  |

Note: Compiled contracts are located under /ethereum/contracts/, and are
produced & determined by zcompile.js
