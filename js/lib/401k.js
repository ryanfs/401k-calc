var customCallback =function(){
    document.getElementById('signal-btn-0').addEventListener("click", function(){
        alert('custom client callback');
    });
    document.getElementById('signal-btn-1').addEventListener("click", function(){
        alert('custom client listener');
    });

}