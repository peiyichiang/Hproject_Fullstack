var UpdateBtn=document.getElementById('UpdateBtn');

UpdateBtn.addEventListener('click',function(){
    // var empty_=0;

    // // 判斷這些欄位 有沒有填寫
    // fieldArray=["p_SYMBOL","p_name","p_location","p_pricing","p_duration","p_currency","p_irr","p_releasedate","p_validdate","p_size","p_totalrelease","p_RPT","p_FRP","p_fundingGoal","p_EPCname","p_PSD","p_CFSD","p_CFED","p_TaiPowerApprovalDate","p_BOEApprovalDate","p_PVTrialOperationDate","p_PVOnGridDate","p_ContractOut","p_CaseConstruction","p_ElectricityBilling","p_ForecastedAnnualIncomePerModule","p_NotarizedRentalContract_form","p_OnGridAuditedLetter_form","icon","csvFIle"]; 
    // for(var i=0;i<fieldArray.length;i++){
    //     ele=document.getElementById(fieldArray[i]);
    //     // ele.previousElementSibling.innerHTML.length<42 是用來判斷 是不是已經加了<必填>
    //     // console.log(ele.value);
    //     if(ele.value==""){
    //         empty_++;
    //         // console.log("＊" + fieldArray[i]);
    //     }
    //     if(ele.value=="" && ele.previousElementSibling.innerHTML.length<42){
    //         ele.previousElementSibling.innerHTML+="<span style='color:red;'>&nbsp(必填)</span>";
    //     }else if(ele.value!="" && ele.previousElementSibling.innerHTML.length>42){
    //         ele.previousElementSibling.innerHTML=ele.previousElementSibling.innerHTML.substr(0,ele.previousElementSibling.innerHTML.length-42);
    //     }
    // }
 
    // // 判斷textArea(p_pvSiteintro)有沒有填寫
    // String.prototype.trim = function() {
    //     return this.replace(/^\s+|\s+$/g,"");
    //   }
    // ele=document.getElementById("p_pvSiteintro");
 
    // if(ele.value==""){
    //     empty_++;
    // }
    // if(ele.value.trim()=="" && ele.previousElementSibling.innerHTML.length<42){
    //     ele.previousElementSibling.innerHTML+="<span style='color:red;'>&nbsp(必填)</span>";
    // }else if(ele.value.trim()!=""){
    //     ele.previousElementSibling.innerHTML=ele.previousElementSibling.innerHTML.substr(0,ele.previousElementSibling.innerHTML.length-42);
    // }

    // if(empty_>0){
    //     window.scrollTo(0, 0);
    // }else{
    //     //上傳圖片
    //     UploadFile();
    // }
    UploadFile();

});

function UploadFile(){
    $.ajax({
        url: '/upload',//請求路徑
        type: 'POST',
        data: new FormData($('#FileForm')[0]),
        contentType: false,//為了讓瀏覽器根據傳入的formdata來判斷contentType
        processData: false,//同上
        success: function(data){
            // alert("成功");
            //上傳成功後將回傳的路徑寫入form input中
            console.log(data);
            try {
                // 房屋/土地租約 
                if(data.filePath['p_NotarizedRentalContract_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_NotarizedRentalContract_path").val(data.filePath['p_NotarizedRentalContract_form'][0].path);
                    // console.log(data.filePath['p_NotarizedRentalContract_form'][0].path);
                    // console.log($("#p_NotarizedRentalContract_path").val());
                    // console.log("=====");

                    // 把理由放到上傳表單中的input
                    $("#p_NotarizedRentalContract_UpdateReason").val($("#p_NotarizedRentalContract_UpdateReasonCopy").val());
                    // console.log($("#p_NotarizedRentalContract_UpdateReason").val());
                    // console.log("=====");
                }
                // 併聯審查意見書
                if(data.filePath['p_OnGridAuditedLetter_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_OnGridAuditedLetter_path").val(data.filePath['p_OnGridAuditedLetter_form'][0].path);
                    // console.log(data.filePath['p_OnGridAuditedLetter_form'][0].path);
                    // console.log($("#p_OnGridAuditedLetter_path").val());
                    // console.log("=====");

                    // 把理由放到上傳表單中的input
                    $("#p_OnGridAuditedLetter_UpdateReason").val($("#p_OnGridAuditedLetter_UpdateReasonCopy").val());
                    // console.log($("#p_OnGridAuditedLetter_UpdateReason").val());
                    // console.log("=====");
                }
                // 能源局同意備案函
                if(data.filePath['p_BOEApprovedLetter_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_BOEApprovedLetter_path").val(data.filePath['p_BOEApprovedLetter_form'][0].path);
                    // console.log(data.filePath['p_BOEApprovedLetter_form'][0].path);
                    // console.log($("#p_BOEApprovedLetter_path").val());
                    // console.log("=====");

                    // 把理由放到上傳表單中的input
                    $("#p_BOEApprovedLetter_UpdateReason").val($("#p_BOEApprovedLetter_UpdateReasonCopy").val());
                    // console.log($("#p_BOEApprovedLetter_UpdateReason").val());
                    // console.log("=====");
                }
                // 台電購售店契約
                if(data.filePath['p_powerPurchaseAgreement_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_powerPurchaseAgreement_path").val(data.filePath['p_powerPurchaseAgreement_form'][0].path);
                    // console.log(data.filePath['p_powerPurchaseAgreement_form'][0].path);
                    // console.log($("#p_powerPurchaseAgreement_path").val());
                    // console.log("=====");

                    // 把理由放到上傳表單中的input
                    $("#p_powerPurchaseAgreement_UpdateReason").val($("#p_powerPurchaseAgreement_UpdateReasonCopy").val());
                    // console.log($("#p_powerPurchaseAgreement_UpdateReason").val());
                    // console.log("=====");
                }
                // 併聯試運轉訪查文件
                if(data.filePath['p_onGridTryrunLetter_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_onGridTryrunLetter_path").val(data.filePath['p_onGridTryrunLetter_form'][0].path);
                    // console.log(data.filePath['p_onGridTryrunLetter_form'][0].path);
                    // console.log($("#p_onGridTryrunLetter_path").val());
                    // console.log("=====");

                    // 把理由放到上傳表單中的input
                    $("#p_onGridTryrunLetter_UpdateReason").val($("#p_onGridTryrunLetter_UpdateReasonCopy").val());
                    // console.log($("#p_onGridTryrunLetter_UpdateReason").val());
                    // console.log("=====");
                }
                // 設備登記文件
                if(data.filePath['p_powerPlantEquipmentRegisteredLetter_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_powerPlantEquipmentRegisteredLetter_path").val(data.filePath['p_powerPlantEquipmentRegisteredLetter_form'][0].path);
                    // console.log(data.filePath['p_powerPlantEquipmentRegisteredLetter_form'][0].path);
                    // console.log($("#p_powerPlantEquipmentRegisteredLetter_path").val());
                    // console.log("=====");

                    // 把理由放到上傳表單中的input
                    $("#p_powerPlantEquipmentRegisteredLetter_UpdateReason").val($("#p_powerPlantEquipmentRegisteredLetter_UpdateReasonCopy").val());
                    // console.log($("#p_powerPlantEquipmentRegisteredLetter_UpdateReason").val());
                    // console.log("=====");
                }
                // 設備保單
                if(data.filePath['p_powerPlantInsurancePolicy_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_powerPlantInsurancePolicy_path").val(data.filePath['p_powerPlantInsurancePolicy_form'][0].path);
                    // console.log(data.filePath['p_powerPlantInsurancePolicy_form'][0].path);
                    // console.log($("#p_powerPlantInsurancePolicy_path").val());
                    // console.log("=====");

                    // 把理由放到上傳表單中的input
                    $("#p_powerPlantInsurancePolicy_UpdateReason").val($("#p_powerPlantInsurancePolicy_UpdateReasonCopy").val());
                    // console.log($("#p_powerPlantInsurancePolicy_UpdateReason").val());
                    // console.log("=====");
                }
                
                
                // 房屋/土地租約(馬賽克)
                if(data.filePath['p_NotarizedRentalContract_Mask_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_NotarizedRentalContract_Mask_path").val(data.filePath['p_NotarizedRentalContract_Mask_form'][0].path);
                    // console.log(data.filePath['p_NotarizedRentalContract_Mask_form'][0].path);
                    // console.log($("#p_NotarizedRentalContract_Mask_path").val());
                    // console.log("=====");
                }
                // 併聯審查意見書(馬賽克)
                if(data.filePath['p_OnGridAuditedLetter_Mask_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_OnGridAuditedLetter_Mask_path").val(data.filePath['p_OnGridAuditedLetter_Mask_form'][0].path);
                    // console.log(data.filePath['p_OnGridAuditedLetter_Mask_form'][0].path);
                    // console.log($("#p_OnGridAuditedLetter_Mask_path").val());
                    // console.log("=====");
                }
                // 能源局同意備案函(馬賽克)
                if(data.filePath['p_BOEApprovedLetter_Mask_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_BOEApprovedLetter_Mask_path").val(data.filePath['p_BOEApprovedLetter_Mask_form'][0].path);
                    // console.log(data.filePath['p_BOEApprovedLetter_Mask_form'][0].path);
                    // console.log($("#p_BOEApprovedLetter_Mask_path").val());
                    // console.log("=====");
                }
                // 台電購售店契約(馬賽克)
                if(data.filePath['p_powerPurchaseAgreement_Mask_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_powerPurchaseAgreement_Mask_path").val(data.filePath['p_powerPurchaseAgreement_Mask_form'][0].path);
                    // console.log(data.filePath['p_powerPurchaseAgreement_Mask_form'][0].path);
                    // console.log($("#p_powerPurchaseAgreement_Mask_path").val());
                    // console.log("=====");
                }
                // 併聯試運轉訪查文件(馬賽克)
                if(data.filePath['p_onGridTryrunLetter_Mask_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_onGridTryrunLetter_Mask_path").val(data.filePath['p_onGridTryrunLetter_Mask_form'][0].path);
                    // console.log(data.filePath['p_onGridTryrunLetter_Mask_form'][0].path);
                    // console.log($("#p_onGridTryrunLetter_Mask_path").val());
                    // console.log("=====");
                }
                // 設備登記文件(馬賽克)
                if(data.filePath['p_powerPlantEquipmentRegisteredLetter_Mask_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_powerPlantEquipmentRegisteredLetter_Mask_path").val(data.filePath['p_powerPlantEquipmentRegisteredLetter_Mask_form'][0].path);
                    // console.log(data.filePath['p_powerPlantEquipmentRegisteredLetter_Mask_form'][0].path);
                    // console.log($("#p_powerPlantEquipmentRegisteredLetter_Mask_path").val());
                    // console.log("=====");
                }
                // 設備保單(馬賽克)
                if(data.filePath['p_powerPlantInsurancePolicy_Mask_form']!=null){
                    //把上傳後返回的地址 放到另一個editform的input
                    $("#p_powerPlantInsurancePolicy_Mask_path").val(data.filePath['p_powerPlantInsurancePolicy_Mask_form'][0].path);
                    // console.log(data.filePath['p_powerPlantInsurancePolicy_Mask_form'][0].path);
                    // console.log($("#p_powerPlantInsurancePolicy_Mask_path").val());
                    // console.log("=====");
                }
                // 將資料寫入資料庫
                document.getElementById("UpdateForm").submit();
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
