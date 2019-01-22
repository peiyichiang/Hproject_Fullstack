// var DeployBtn=document.getElementById('DeployBtn');

// DeployBtn.addEventListener('click',function(){
//     UploadImage();
// });

function UploadImage(){
    $.ajax({
        url: '/assetContractAPI/POST/deploy',//請求路徑
        type: 'POST',
        data: {assetOwner:"0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", platform:"0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB", thirdparty:"0x17200B9d6F3D0ABBEccB0e451f50f7c6ed98b5DB"},
        contentType: false,//為了讓瀏覽器根據傳入的formdata來判斷contentType
        processData: false,//同上
        success: function(data){
            alert("成功");
            alert(JSON.stringify(data));
        },
        error: function(data){
            alert("失敗");
            alert(JSON.stringify(data));
        }
    });
}
