var register=document.getElementById('register');
var m_password_1=document.getElementById('m_password_1');
var m_password_2=document.getElementById('m_password_2');
var m_ResetPasswordHash=document.getElementById('m_ResetPasswordHash');

//監聽註冊按鈕
register.addEventListener('click',function(){
    //判斷密碼是否相同
    if(m_password_1.value=="" || m_password_2.value==""){
        alert("密碼不可為空");
    }else if(m_password_1.value!=m_password_2.value){
        alert("密碼不同");
    }else if(m_password_1.value==m_password_2.value){
        // 密碼相同

		//將hash放到form中
		m_ResetPasswordHash.value=getParameterByName("hash");
		// alert(m_ResetPasswordHash.value);
		document.getElementById("ResetPasswordform").submit();
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