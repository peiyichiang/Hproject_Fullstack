#!/bin/bash
#chmod u+x script.sh
echo "inside bash script ..."
serverIP=140.119.101.130

sed -i 's/140.119.101.130/localhost/g' app.js
echo "app.js: custom ip => localhost"

sed -i 's/const isTestingMode = true;/const isTestingMode = false;/g' ethereum/contracts/zsetupData.js
sed -i 's/const whichTimeServerArray = [0, 0, 0, 0, 0, 0];/const whichTimeServerArray = [1, 1, 1, 1, 1, 1];/g' ethereum/contracts/zsetupData.js

sed -i 's/const backendAddr = AssetOwner5/const backendAddr = admin/g' timeserver/blockchain.js
sed -i 's/const backendAddrpkRaw = AssetOwner5pkRaw/const backendAddrpkRaw = adminpkRaw/g' timeserver/blockchain.js

sed -i 's/const timeInverval = 20/const timeInverval = 60/g' timeserver/timeserverSource.js

#sed -i 's+console.log(+//console.log(+g' timeserver/mysql.js

sed -i 's/localhost/140.119.101.130/g' routes/user.js
sed -i 's/localhost/140.119.101.130/g' routes/verify_fail.html
sed -i 's/localhost/140.119.101.130/g' routes/verify_success.html

sed -i 's/localhost/140.119.101.130/g' views/*.ejs
sed -i 's/127.0.0.1/140.119.101.130/g' views/*.ejs
sed -i 's/127.0.0.1/140.119.101.130/g' public/js/SignOut.js

#sed -i 's/\/GET//g' routes/backend_user.js
#sed -i 's/\/POST//g' routes/backend_user.js
#sed -i 's/\/GET//g' routes/Product.js
#sed -i 's/\/POST//g' routes/Product.js
#sed -i 's/\/GET//g' views/*.ejs
#sed -i 's/\/POST//g' views/*.ejs

echo "routes/user.js, verify_fail and verify_success: localhost => custom ip"

echo "script finished"
