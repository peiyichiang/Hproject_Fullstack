var m_permission=document.getElementById('m_permission');
var m_permission_list=document.getElementById('m_permission_list');


window.onload=function(){
    //將資料庫中撈到的權限資料設置在select選單中
    for(var i=0;i<m_permission_list.options.length;i++){
        // alert(m_permission_list.options[i].value);
        // alert(m_permission.value);
        // alert(m_permission_list.options[i].value);
        if(m_permission.value==m_permission_list.options[i].value){
            m_permission_list.selectedIndex=i;
        }
    }
  }

  //當權限選單改變，將新的權限設置給m_permission
function onSelectChange(opt){
    m_permission.value=opt;
}