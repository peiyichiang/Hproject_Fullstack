**Utilities.js**

**Working with value checking & validation, array manipulation, CSV loading,
sequential asynchronous actions, ...**

| Packages | Descriptions|
|----------|-------------|
| fs   | File system read/write support |

**Imported functions and variables from /ethereum/contracts/zsetupData.js**

| Imported variables or functions | Type | Descriptions  |
|--------------|----------|--------|
| excludedSymbols | variable | Symbols to be excluded for special cases |
| COMPLIANCE_LEVELS   | variable | Compliance level for users. This is an object that is written exactly according to Regulatory specifications. So the system can check if a particular user is allowed to buy certain amount of tokens at that time |
| wlogger  | function | WinstonJs logger functional object for displaying different logging levels   |

**Imported functions from /timeserver/envVariables.js**

| Imported Functions   | Descriptions   |
|---|---|
| isLivetimeOn | ServerTime is given from getTimeServerTime(), which is controlled by isLivetimeOn in the env file. If IS_LIVETIME_ON is 1, then isLivetimeOn will be true, and getTimeServerTime() will return localtime. If not, then getTimeServerTime() will return a fake servertime, which can be set in env file |
| fakeServertime   | See above  |
| crowdfundingScenario | An integer to determine if the funding status is:  1.Sold out … funding successful  2.Ended with goal reached … funding successful.3.Ended with goal not reached … funding failed |



Note. in the following functions. The naming indicates the returned value types:
If the name starts with ‘is’, then it returns a boolean.

**Functions defined within utilities.js**

| Function Name | Parameters | Description   |
|---------------|------------|------------|
| checkEq   | value1, value2| Check if the two given values are equal in both value and type|
| isEmpty   | value  | Check if the given value is undefined, null, empty object, empty string or string of ‘undefined’|
| isNoneInteger | value  | Check if the given value is undefined, null, object, or string that cannot be converted into integer|
| isInvalidArray| value  | Check if the given value is not of array type or array length is zero|
| isAllTruthy   | myObj  | Returns if all given object properties are truthy|
| isAllTrueBool | myObj  | Returns if all given object properties are exactly true   |
| getLocalTime  | \- | Get local machine time, then convert it into an integer   |
| getTimeServerTime| \- | See isLivetimeOn above   |
| Date.prototype.myFormat  | \- | A custom date format function for making YYYYMMDDHHMM format  |
| testInputTime | inputTime  | Test if the given time is of a valid format as specified in YYYYMMDDHHMM and it should not represent a time in the past |
| checkBoolTrueArray   | item   | Returns the given item   |
| isInt | item   | Checks if the given value is an integer  |
| isIntAboveZero| item   | Checks if the given value is a positive integer  |
| arraySum  | arr| Sum of all elements in the given array   |
| makeIndexArray| \_length   | Make an array whose element values are the same as their array index values  |
| sumIndexedValues | Indexes, values   | Sum of all elements whose element indexes are specified in the indexes array |
| makeFakeTxHash| \- | Make fake Ethereum transaction hash  |
| getAllIndexes | Arr, val   | Get all array element indexes of a particular value   |
| getArraysFromCSV | eoaPath, itemNumberPerLine| Get arrays from a csv file, inside which there are lines of arrays   |
| getOneAddrPerLineFromCSV | eoaPath| Get one address per line inside the given csv file|
| reduceArrays  | toAddressArray, amountArray   | Reduce multiple duplicated address-amount pairs into unique pairs|
| arraysSortedEqual| array1, array2| compare array elements after sorting both arrays |
| getRndIntegerBothEnd | min, max   | Get a random number between min and max  |
| getBuyAmountArray| totalAmount, price, fundingType  | Get buy amount that is complied with Regulation on the max buy amount|
| getInputArrays| arraylength = 3, totalTokenAmount| Get input arrays of userIndexArray and tokenCountArray|
| makeCorrectAmountArray   | amountArray, goal, maxTotal | Make correct amounts for different funding scenarios: 1.Funding Sold out: all maxTotal should be distributed inside amountArray.  2.Funding ended with goal reached: total output amount array should only sum up to be just above the goal.   3.Funding ended with goal not reached(funding failed): total output amount array should only sum up to be just below the goal   |
| asyncForEach  | array, callback   | A function to sequentially execute an asynchronous callback function in the order of given array items  |
| asyncForEachTsMain   | array, callback   | Same as asyncForEach for object and non-object array as input, with excluded symbols|
| asyncForEachMint | toAddrArray, callback | Same as asyncForEach for address array as input, for mintTokens outer loop   |
| asyncForEachMint2| toAddrArray, idxMint, idxMintMax, callback   | Same as asyncForEach for address array as input, for mintTokens inner loop. Two extra input for showing idxMint out of idxMintMax   |
| asyncForEachCFC  | toAddrArray, callback | Same as asyncForEach for toAddress array as input|
| asyncForEachAbCFC| toAddrArray, callback | Same as asyncForEach for toAddress array as input|
| asyncForEachAbCFC2   | toAddrArray, callback | Same as asyncForEach for toAddress array as input|
| asyncForEachAbCFC3   | toAddrArray, callback | Same as asyncForEach for toAddress array as input|
| asyncForEachOrderExpiry  | toAddrArray, callback | Same as asyncForEach for toAddress array as input|
| asyncForEachAssetRecordRowArray  | toAddrArray, callback | Same as asyncForEach for toAddress array as input|
| asyncForEachAssetRecordRowArray2 | toAddrArray, callback | Same as asyncForEach for toAddress array as input|
| checkTargetAmounts   | existingBalances, targetAmounts  | Check if each balance is less or equal to each amount respectively   |
| breakdownArray| toAddress, amount, maxMintAmountPerRun   | Break down given amount into an array of maxMintAmountPerRun and a remainder amount so each output array element is less or equal to maxMintAmountPerRun|
| breakdownArrays  | toAddressArray, amountArray, maxMintAmountPerRun | For each of given amountArray, reak down given amount into an array of maxMintAmountPerRun and a remainder amount so each output array element is less or equal to maxMintAmountPerRun |
| validateEmail | email  | Validate email input |
