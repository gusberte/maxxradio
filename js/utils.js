var Utils = (function(){
    return{
        getLocation : function( onComplete){
            navigator.geolocation.getCurrentPosition(
                function(position){
                    onComplete( position.coords.latitude, position.coords.longitude );
                }
                , function(error){
                    onComplete( -1, -1 );
            });
        },
    }
})();