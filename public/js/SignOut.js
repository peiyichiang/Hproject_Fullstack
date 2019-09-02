var SignOutBtn=document.getElementById('SignOut');
SignOutBtn.addEventListener('click',function(event){
    event.preventDefault();
    $.removeCookie('access_token', { path: '/' });
    // $.cookie('access_token',null)
    window.location.href = 'http://127.0.0.1:3030/BackendUser/BackendUserLogin';
});
