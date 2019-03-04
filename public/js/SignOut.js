var SignOutBtn=document.getElementById('SignOut');
SignOutBtn.addEventListener('click',function(event){
    event.preventDefault();
    $.removeCookie('access_token', { path: '/' });
    window.location.href = 'http://140.119.101.130:3000/BackendUser/BackendUserLogin';
});
