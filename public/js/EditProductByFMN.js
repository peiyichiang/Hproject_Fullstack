var modify=document.getElementById('modify');

modify.addEventListener('click',function(){
    var empty_=0;

    // 判斷這些欄位 有沒有填寫
    fieldArray=["p_SYMBOL","p_name","p_location","p_pricing","p_duration","p_currency","p_irr","p_releasedate","p_validdate","p_size","p_totalrelease","p_RPT","p_FRP","p_fundingGoal","p_EPCname","p_PSD","p_CFSD","p_CFED","p_TaiPowerApprovalDate","p_BOEApprovalDate","p_PVTrialOperationDate","p_PVOnGridDate","p_ContractOut","p_CaseConstruction","p_ElectricityBilling"]; 
    for(var i=0;i<fieldArray.length;i++){
        ele=document.getElementById(fieldArray[i]);
        // ele.previousElementSibling.innerHTML.length<42 是用來判斷 是不是已經加了<必填>
        if(ele.value==""){
            empty_++;
        }
        if(ele.value=="" && ele.previousElementSibling.innerHTML.length<42){
            ele.previousElementSibling.innerHTML+="<span style='color:red;'>&nbsp(必填)</span>";
        }else if(ele.value!="" && ele.previousElementSibling.innerHTML.length>42){
            ele.previousElementSibling.innerHTML=ele.previousElementSibling.innerHTML.substr(0,ele.previousElementSibling.innerHTML.length-42);
        }
    }
 
    // 判斷textArea(p_Copywriting)有沒有填寫
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g,"");
      }
    ele=document.getElementById("p_Copywriting");
 
    if(ele.value==""){
        empty_++;
    }
    if(ele.value.trim()=="" && ele.previousElementSibling.innerHTML.length<42){
        ele.previousElementSibling.innerHTML+="<span style='color:red;'>&nbsp(必填)</span>";
    }else if(ele.value.trim()!=""){
        ele.previousElementSibling.innerHTML=ele.previousElementSibling.innerHTML.substr(0,ele.previousElementSibling.innerHTML.length-42);
    }

    if(empty_>0){
        window.scrollTo(0, 0);
    }else{
        // 將token ID傳到uplod API，文件命名用
        // $("#tokenID").val($("#p_SYMBOL").val());
        //上傳圖片
        UploadImage();
    }
});

function UploadImage(){
    $.ajax({
        url: '/upload',//請求路徑
        type: 'POST',
        data: new FormData($('#FileForm')[0]),
        contentType: false,//為了讓瀏覽器根據傳入的formdata來判斷contentType
        processData: false,//同上
        success: function(data){
            // alert("成功");
            //上傳成功後將回傳的路徑寫入form input中
            // if(data.iconPath!=""){
            //     $("#p_icon").val(data.iconPath);
            // }
            // if(data.filePath!=""){
            //     $("#p_assetdocs").val(data.filePath);
            // }
            try {
                if(data.filePath['file']!=null){
                    $("#p_assetdocs").val(data.filePath['file'][0].path);
                    // console.log(data.filePath['file'][0].path);
                }
                if(data.filePath['icon']!=null){
                    $("#p_icon").val(data.filePath['icon'][0].path);
                    // alert(data.filePath['icon'][0].path);
                }
                if(data.filePath['csvFIle']!=null){
                    $("#p_csvFIle").val(data.filePath['csvFIle'][0].path);
                    // alert(data.filePath['csvFIle'][0].path);
                }
                if(data.filePath['image1']!=null){      
                    $("#p_Image1").val(data.filePath['image1'][0].path);
                    // console.log("Image1：" + data.filePath['image1'][0].path);
                }
                if(data.filePath['image2']!=null){  
                    $("#p_Image2").val(data.filePath['image2'][0].path);    
                    // console.log("Image2：" + data.filePath['image2'][0].path);
                }
                if(data.filePath['image3']!=null){      
                    $("#p_Image3").val(data.filePath['image3'][0].path);
                    // console.log("Image3：" + data.filePath['image3'][0].path);
                }
                if(data.filePath['image4']!=null){   
                    $("#p_Image4").val(data.filePath['image4'][0].path);   
                    // console.log("Image4：" + data.filePath['image4'][0].path);
                }
                if(data.filePath['image5']!=null){  
                    $("#p_Image5").val(data.filePath['image5'][0].path);    
                    // console.log("Image5：" + data.filePath['image5'][0].path);
                }
                if(data.filePath['image6']!=null){   
                    $("#p_Image6").val(data.filePath['image6'][0].path);   
                    // console.log("Image6：" + data.filePath['image6'][0].path);
                }
                if(data.filePath['image7']!=null){      
                    $("#p_Image7").val(data.filePath['image7'][0].path);
                    // console.log("Image7：" + data.filePath['image7'][0].path);
                }
                if(data.filePath['image8']!=null){   
                    $("#p_Image8").val(data.filePath['image8'][0].path);   
                    // console.log("Image8：" + data.filePath['image8'][0].path);
                }
                if(data.filePath['image9']!=null){  
                    $("#p_Image9").val(data.filePath['image9'][0].path);    
                    // console.log("Image9：" + data.filePath['image9'][0].path);
                }
                if(data.filePath['image10']!=null){ 
                    $("#p_Image10").val(data.filePath['image10'][0].path);     
                    // console.log("Image10：" + data.filePath['image10'][0].path);
                }
                // 將修改後的資料存回資料庫
                document.getElementById("editform").submit();
            }
            catch(err) {
                console.log(err);
            }

        },
        error: function(data){
            alert(JSON.stringify(data));
        }
    });
}

// 計算文件SHA3
let web3Object = new Web3()
// 用選擇的方式讀取文件Hash(Inquire.html用)
$("#file").on('change', function() {
    // alert("選擇文件！");
        var reader1 = new FileReader(); //define a Reader
        var file = $("#file")[0].files[0]; //get the File object 
        if (!file) {
            alert("no file selected");
            return;
        } //check if user selected a file

    reader1.onloadend = function (evt) {
        //計算hash
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            alert(web3Object.utils.sha3(evt.target.result));
            $("#p_assetdocsHash").val(web3Object.utils.sha3(evt.target.result));
        }

    }

    reader1.readAsDataURL(file);
});
