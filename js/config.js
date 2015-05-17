var Config=  (function(){

	var serviceJson ="http://www.maxxdjradiomexico.com/";
	    fbAppId = "";
	    googleId = "";
	    currentLat = 0;
	    currentLong = 0;
	    geolocationState = true;
	    currentUserId =0;
	    durationAdsIntro =3000;
	    loadAdsInterval =  300000;
	    changeAds1Interval = 20000;
	    changeAds2Interval = 20000;
	    changeAds3Interval = 10000;

	return {
		'serviceJson': serviceJson,
	    'fbAppId' :fbAppId,
	    'currentLat': currentLat,
	    'currentLong': currentLong,
	    'geolocationState': geolocationState,
	    'currentUserId': 0,
	    'loadAdsInterval': loadAdsInterval,
	    'changeAds1Interval': changeAds1Interval,
	    'changeAds2Interval': changeAds2Interval,
	    'changeAds3Interval': changeAds3Interval,

		load: function( onComplete ){
			$.post(Config.serviceJson+"/back/api/web/getconfig", 
	            function(data){
	                var obj = eval(data);

	                fbAppId = obj.fbAppId;
	                googleId = obj.googleId;
					loadAdsInterval = obj.fbAppId;
					if( obj.durationAdsIntro != undefined) durationAdsIntro= obj.durationAdsIntro;
					if( obj.changeAds1Interval != undefined) changeAds1Interval= obj.changeAds1Interval;
					if( obj.changeAds2Interval != undefined) changeAds2Interval= obj.changeAds2Interval;
					if( obj.changeAds3Interval != undefined) changeAds3Interval = obj.changeAds3Interval;
		    		onComplete();
	            }
	        );
		}
	}
})();

	
	