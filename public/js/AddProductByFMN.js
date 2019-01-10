var addBtn=document.getElementById('addBtn');

addBtn.addEventListener('click',function(){
    // document.getElementById("addProductForm").submit();
    // document.getElementById("FileForm").submit();

    // 將token ID傳到uplod API，文件命名用
    // $("#tokenID").val($("#p_SYMBOL").val());
    //上傳圖片
    UploadImage();
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
            $("#p_icon").val(data.iconPath);
            $("#p_assetdocs").val(data.filePath);
            document.getElementById("addProductForm").submit();
        },
        error: function(data){
            alert(JSON.stringify(data));
        }
    });
}
