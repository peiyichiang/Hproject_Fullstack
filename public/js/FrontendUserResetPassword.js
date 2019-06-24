var register=document.getElementById('register');
var password1=document.getElementById('password1');
var password2=document.getElementById('password2');
var resetPasswordHash=document.getElementById('resetPasswordHash');

//監聽註冊按鈕
register.addEventListener('click',function(){
    //判斷密碼是否相同
    if(password1.value=="" || password2.value==""){
        alert("密碼不可為空");
    }else if(password1.value!=password2.value){
        alert("密碼不同");
    }else if(password1.value==password2.value){
        // 密碼相同

		//將hash放到form中
		resetPasswordHash.value=getParameterByName("hash");
		// alert(resetPasswordHash.value);
        document.getElementById("ResetPasswordform").submit();
        console.log(document.getElementById("ResetPasswordform"))
    }
    
});


//Get URL Query String
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}