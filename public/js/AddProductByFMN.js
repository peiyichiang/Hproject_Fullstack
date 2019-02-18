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
            // console.log(data);
            try {
                if(data.filePath['file']!=null){
                    $("#p_assetdocs").val(data.filePath['file'][0].path);
                    // console.log(data.filePath['file'][0].path);
                }
                if(data.filePath['icon']!=null){
                    $("#p_icon").val(data.filePath['icon'][0].path);
                    // console.log(data.filePath['icon'][0].path);
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
                // 將資料寫入資料庫
                document.getElementById("addProductForm").submit();
            }
            catch(err) {
                console.log(err);
            }
            // $("#p_icon").val(data.iconPath);
            // $("#p_assetdocs").val(data.filePath);
            // $("#image1").val(data.image1Path);
            // $("#image2").val(data.image2Path);
            // $("#image3").val(data.image3Path);
            // document.getElementById("addProductForm").submit();
        },
        error: function(data){
            alert(JSON.stringify(data));
        }
    });
}
