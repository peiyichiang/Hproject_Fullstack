// 計算文件SHA3
let web3_ = new Web3()

// 用選擇的方式讀取文件Hash(Inquire.html用)
$("#file-3").on('change', function() {
    // alert("選擇文件！");
        var reader1 = new FileReader(); //define a Reader
        var file = $("#file-3")[0].files[0]; //get the File object 
        if (!file) {
            alert("no file selected");
            return;
        } //check if user selected a file

    reader1.onloadend = function (evt) {
        //計算hash
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            alert(web3_.utils.sha3(evt.target.result));
            fileHash.val(web3_.utils.sha3(evt.target.result));
            // console.log(web3_.utils.sha3(evt.target.result));
            // alert(web3_.utils.sha3(evt.target.result));
                // alert(fileHash.val());

                if(fileHash.val()==infoFileHash.val())
                {
                    document.getElementById('RightResult').click();
                }else{
                    document.getElementById('WrongResult').click();
                }

        }

    }

    reader1.readAsDataURL(file);
});

