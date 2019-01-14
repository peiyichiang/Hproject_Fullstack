var SignOutBtn=document.getElementById('SignOut');
SignOutBtn.addEventListener('click',function(event){
    event.preventDefault();
    $.removeCookie('access_token', { path: '/' });
    window.location.href = 'http://127.0.0.1:3000/BackendUser/GET/BackendUserLogin';
});
