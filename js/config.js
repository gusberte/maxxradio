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
	    clickEvent = 'click';

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
	    'clickEvent': clickEvent,

		load: function( onComplete ){
			var posting = $.post(Config.serviceJson+"/back/api/web/getconfig");
			posting.done(function(data){
	                var obj = eval(data);
	                console.log(obj[0].fbAppId);
	                Config.fbAppId = obj[0].fbAppId;
	                Config.googleId = obj[0].googleId;
					Config.loadAdsInterval = obj[0].fbAppId;
					if( obj[0].durationAdsIntro != undefined) Config.durationAdsIntro= obj[0].durationAdsIntro;
					if( obj[0].changeAds1Interval != undefined) Config.changeAds1Interval= obj[0].changeAds1Interval;
					if( obj[0].changeAds2Interval != undefined) Config.changeAds2Interval= obj[0].changeAds2Interval;
					if( obj[0].changeAds3Interval != undefined) Config.changeAds3Interval = obj[0].changeAds3Interval;
		    		onComplete();
	        });
	        posting.fail(function(data){
	        	onComplete();
	        });
		}
	}
})();

	
	