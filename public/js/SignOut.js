var SignOutBtn=document.getElementById('SignOut');
SignOutBtn.addEventListener('click',function(event){
    event.preventDefault();
    $.removeCookie('access_token', { path: '/' });
    // $.cookie('access_token',null)
    window.location.href = "/BackendUser/BackendUserLogin";
    
});
