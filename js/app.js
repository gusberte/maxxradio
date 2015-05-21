var App = (function(){
    
    var nroDisco=0;
    var adFlag=0;
    var closeAds=true;
    var discos;
    var advertises1 = new Array();
    var advertises2 = new Array();
    var advertises3 = new Array();
    var geolocate = false;
    var isOpen = false,
        isAnimating = false;
        stationsPlayer= Array();
        stationPlaying=0;

    // Local copy of jQuery selectors, for performance.
    var my_jPlayer = $("#jquery_jplayer"),
        my_trackStation = $(".player .track-station"),
        my_trackName = $(".player .track-name"),
        my_playState = $(".player .play-state"),
        my_extraPlayInfo = $(".player .extra-play-info");

    // Some options
    var opt_play_first = false, // If true, will attempt to auto-play the default track on page loads. No effect on mobile devices, like iOS.
        opt_auto_play = true, // If true, when a track is selected, it will auto-play.
        opt_text_playing = "Now playing", // Text when playing
        opt_text_selected = "Tocando"; // Text when not playing

    // A flag to capture the first track
    var first_track = true;

    var toggleMenu =  function() {
        if( isAnimating ) return false;
        isAnimating = true;
        if( isOpen ) {
            $('body').removeClass( 'show-menu' );
        }
        else {
            $('body').addClass( 'show-menu' );
        }
        setTimeout(function(){isAnimating = false},200);
        isOpen = !isOpen;
    }

    var toggleMenu2 =  function() {
        if( isAnimating ) return false;
        isAnimating = true;
        if( isOpen ) {
            $('body').removeClass( 'show-menu-secondary' );         
        }
        else {
            $('body').addClass( 'show-menu-secondary' );
        }
        setTimeout(function(){isAnimating = false},200);
        isOpen = !isOpen;
    }

    var checkChannels = function(){
        $.post(Config.serviceJson+"/back/api/web/getchannel", function(data){
            var tracks="";
            var obj = eval(data);

            $.each(obj, function(key, value){
                tracks = '<div class="swiper-slide"><span style="background-image: url('+Config.serviceJson+'/back/uploads/stations/' + value.photo + ');border: solid 2px #FFFFFF;"></span></div>';
                discos.appendSlide(tracks);
            });

            $(".player .right h2").html(obj[0].name);
            $(".player .right h3").html(obj[0].description);
            $(".player .jp-play").attr("href", obj[0].url);
        });
    }

    var getStations = function(){

        tracks = '<div class="swiper-slide" data-image="'+Config.serviceJson+'/back/uploads/disc1.jpg" data-name="R3HAB" data-title="Imagine"><span style="background-image: url('+Config.serviceJson+'/back/uploads/disc1.jpg);border: solid 2px #FFFFFF;"></span></div>';
        discos.appendSlide(tracks);
        tracks = '<div class="swiper-slide" data-image="'+Config.serviceJson+'/back/uploads/disc2.jpg" data-name="Glaser" data-title="Titanium" ><span style="background-image: url('+Config.serviceJson+'/back/uploads/disc2.jpg);border: solid 2px #FFFFFF;"></span></div>';
        discos.appendSlide(tracks);
        tracks = '<div class="swiper-slide" data-image="'+Config.serviceJson+'/back/uploads/disc3.jpg" data-name="2Elements" data-title="Armin Vaan Buren" ><span style="background-image: url('+Config.serviceJson+'/back/uploads/disc3.jpg);border: solid 2px #FFFFFF;"></span></div>';
        discos.appendSlide(tracks);

        $.post(Config.serviceJson+"/back/api/web/getstations", function(data){
            var stations="";
            var obj = eval(data);

            $.each(obj, function(key, value){
                stations +='<a href="' + value.url + '" class="playstation" data-id="'+value.idstation+'" data-name="'+value.name+'" data-image="'+Config.serviceJson+'/back/uploads/'+value.diskimage+'"><span>' + value.name + '</span><img src="'+Config.serviceJson+'/back/uploads/stations/' + value.photo + '" /></a>';            
                //tracks = '<div class="swiper-slide" data-image="'+Config.serviceJson+'/back/uploads/'+value.diskimage+'" data-name="'+value.name+'" data-station="'+value.url+'"><span style="background-image: url('+Config.serviceJson+'/back/uploads/'+value.diskimage+');border: solid 2px #FFFFFF;"></span></div>';
                //discos.appendSlide(tracks);
                stationsPlayer[stationsPlayer.length] = {'id':value.idstation,'url':value.url,'favs':0,'name':value.name};
            });

            $('.radios').append(stations);
        }); 

        $('.track-station').html($('.swiper-slide-active').data('name'));
       
    }

    var getUserId = function( onComplete ){
        var dbConn = new DB();
        dbConn.execute("CREATE TABLE IF NOT EXISTS maxradio (userid)",function(){
            dbConn.query("SELECT * FROM maxradio", [], function(users){
                if( users.length >0 ){
                    onComplete(users.item(0).userid);
                }else{
                    onComplete(null);
                }
            });
        });
    }

    var setNextPrevSong = function(){
        if( nroDisco ==0){
            $('.nextsong').css('opacity','0.4');
            $('.prevsong').css('opacity','0.03');
        }
        if( nroDisco ==1){
            $('.nextsong').css('opacity','0.4');
            $('.prevsong').css('opacity','0.4');
        }
        if( nroDisco ==2){
            $('.nextsong').css('opacity','0.03');
            $('.prevsong').css('opacity','0.4');
        }
    }

    var initEvents = function(){

        $('.like').click(function(e){
            e.preventDefault();
            if( ! $('.like').hasClass('.disabled') ){
                $('.dislike').addClass('.disabled');
                $('.like i').css("color","#f00");
                $('.dislike i').css("opacity","0.04");
            }
        });

        $('.dislike').click(function(e){
            e.preventDefault();
             if( ! $('.dislike').hasClass('.disabled') ){
                $('.like').addClass('.disabled');
                $('.dislike i').css("color","#f00");
                $('.like i').css("opacity","0.04");
            }
        });

        $('.nextsong').click(function(e){
            e.preventDefault();
            discos.slideNext(true,500);
            nroDisco++;
            if( nroDisco >2) nroDisco = 2;
            setNextPrevSong();
            var name = $('.swiper-slide-active').data('name');
            var image = $('.swiper-slide-active').data('image');
            $('.track-station').html(name);
            $('.swiper-slide-active span').css('background','url('+image+') no-repeat').css('background-position','center center').css('background-size','100% 100%');
        });

        $('.prevsong').click(function(e){
            e.preventDefault();
            discos.slidePrev(true,500);
            nroDisco--;
            if( nroDisco <0) nroDisco = 0;
            setNextPrevSong();
            var name = $('.swiper-slide-active').data('name');
            var image = $('.swiper-slide-active').data('image');            
            $('.track-station').html($('.swiper-slide-active').data('name'));
            $('.swiper-slide-active span').css('background','url('+image+') no-repeat').css('background-position','center center').css('background-size','100% 100%');
        });

        $('#open-button').on( Config.clickEvent, toggleMenu );
        $('#close-button').on( Config.clickEvent, toggleMenu );
        
        $('#open-button-secondary').on( Config.clickEvent, toggleMenu2 );
        $('#close-button-secondary').on( Config.clickEvent, toggleMenu2);

        $(".menu-wrap .back").on(Config.clickEvent,function(){
            toggleMenu();
        }); 

        $(".menu-wrap-secondary .back").on(Config.clickEvent,function(){
            toggleMenu2();
        });

        $(".advertise .close-button").on(Config.clickEvent,function(){
            closeAdvertise1();
        });  

        $(".login .close-button").on(Config.clickEvent,function(){
            $(".login").fadeOut();
        }); 
        
        $("#contact .close-button").on(Config.clickEvent,function(){
            $('#contact .message').html("");
            $('#contact .contact').show();
            $('.contact-subject').css("background-color",'none');
            $('.contact-message').css("background-color",'none');
            $('.contact-subject').css("color",'#f00');
            $('.contact-message').css("color",'#f00');
            $(".contact-subject").val('');
            $(".contact-message").val('');
        }); 

        $(".login .face").click(function(e){
            e.preventDefault();
            openFB.login(
                function(response) {
                    if (response.status === 'connected') {
                        openFB.api({
                            path: '/me',
                            success: function(data) {
                                $.post(Config.serviceJson+"/back/api/web/registroapp",
                                    {'mail':data.email,'name':data.first_name,'lastname':data.last_name,'telephone':'','lat':currentLat,'long':currentLong,'fbid':data.id,'gender':data.gender,'timezone':data.timezone},
                                    function(data){
                                        var dbConn = new DB();
                                        dbConn.execute("INSERT INTO maxradio (userid) VALUES("+data+")", function(){});
                                        closeLogin();
                                    }
                                );
                            },
                            error: function(){}
                        });

                        $scope.closeLogin();
                    } else {
                        alert('Facebook login failed');
                    }
                },
                {scope: 'email'}
            );
        });

        $(".login .submit").on(Config.clickEvent,function(){
            var email = $('.login #mail').val();
            var nombre = $('.login #nombre').val();
            var telefono = $('.login #telefono').val();
            var apellido = $('.login #apellido').val();
            
            showLoader();
            $.post(Config.serviceJson+"/back/api/web/registroapp",
                {'mail':email,'name':nombre,'lastname':apellido,'telephone':telefono,'lat':currentLat,'long':currentLong},
                function(data){
                    hideLoader();
                    if( data == 'false'){
                        $('#mail').css("background-color","#f00");
                    }else{
                        var dbConn = new DB();
                        dbConn.execute("INSERT INTO maxradio (userid) VALUES("+data+")", function(){});
                        closeLogin();
                    }
                }
            );
        });

        $('.vol-selector').on(Config.clickEvent,function(e){
            e.preventDefault();
            var pos =$(this).data('vol');
            setVolume(pos);
        });

        // Create click handlers for the different tracks
        $(".jp-play").on(Config.clickEvent,function(e) {
            e.preventDefault();
            //playUrl(stationsPlayer[0],$('.swiper-slide.swiper-slide-active').data('name'),$('.swiper-slide.swiper-slide-active').data('image'));
            playStation(stationsPlayer[stationPlaying].url);
        });

        $('.jp-play, .jp-pause, .cover .track, .playstation').on({
            click: function(){
                if( $('.jp-play').css('display') == "block" ){
                    $('.swiper-slide-active span').addClass('fa-spin fa');
                } else {
                    $('.swiper-slide-active span').removeClass('fa-spin fa');
                }
                $('.swiper-slide-next span').removeClass('fa-spin fa');
                $('.swiper-slide-prev span').removeClass('fa-spin fa');
            },
        })

        //discos.on('slideChangeEnd', function () {
        //   playUrl($('.swiper-slide.swiper-slide-active').data('station'),$('.swiper-slide.swiper-slide-active').data('name'),$('.swiper-slide.swiper-slide-active').data('image'));
        //});

        $('body').on(Config.clickEvent,".playstation", function(e) {
            e.preventDefault();
            //Buscando el slide que debo mostrar 
            /*var i=0;
            var name= $(this).data('name');
            $('.swiper-slide').each(function( index ) {
                if( $(this).data('name') == name ){ i=index;}
            });
            discos.slideTo(i, 500, false);
            */
            //playUrl($(this).attr("href"),$(this).data('name'),$(this).data('image'));

            //Buscando la estación
            var station=null;
            for(i=0; i< stationsPlayer.length; i++){
                if( stationsPlayer[i].id == $(this).data('id') ){
                    stationPlaying = i;
                    break;
                }
            }
            playStation(stationsPlayer[stationPlaying].url);

            //Configurando el favs
            if( stationsPlayer[stationPlaying].fav == 1 ){
                $('.heart i').removeClass("icon-favorites_O").addClass("icon-favorites");
            }else{
                $('.heart i').removeClass("icon-favorites").addClass("icon-favorites_O");
            }
        });

        $('.heart').on(Config.clickEvent,function(e){
            $('.heart i').removeClass("icon-favorites_O").addClass("icon-favorites");
            stationsPlayer[stationPlaying].fav=1;
        });

        $('a.mix-over').on(Config.clickEvent,function(e){
            e.preventDefault();
            toggleMenu();
            if($(this).attr('href') == "#events") {
                loadEvents(function(){
                    openPage('#events');
                });
            }else if($(this).attr('href') == "#partners") {
                loadPartners(function(){
                    openPage('#partners');
                });
             }else if($(this).attr('href') == "#favs") {
                var html="<ul class='last'>";
                for(i=0; i< stationsPlayer.length; i++){
                    if( stationsPlayer[i].fav == 1){
                        html+='<li><a href="'+ stationsPlayer[i].url +'" class="playstation" data-id="'+ stationsPlayer[i].id +'" data-name="'+ stationsPlayer[i].name +'"><h3>'+ stationsPlayer[i].name +'</h3></a></li>';
                    }
                }
                html+="</ul>";
                $('#favs .over-content').html(html);
                openPage($(this).attr('href'));
            }else{
                openPage($(this).attr('href'));
            }
        });

        $(".page .close-button").on(Config.clickEvent,function(){
            $(this).parent().attr("class","page transition right");
        });  

        $(".contact-submit").on(Config.clickEvent,function(){
            sendContactForm();
        })

        $('.inappbrowser').on(Config.clickEvent,function(e){
            e.preventDefault();
            var ref = window.open($(this).attr('href'), '_blank', 'location=yes');
        });
    }

    var openPage = function(id){
        $('.page').not('.player,'+id).attr("class","page transition right");
        $(id).attr("class","page transition center");
    }

    /*DEPRECADO PARA ËSTA VERSION
    var playUrl = function( url, station, image ){
        my_jPlayer.jPlayer("setMedia", {mp3: url});
        my_jPlayer.jPlayer("play");

        $('.swiper-slide.swiper-slide-prev span').removeClass('fa-spin fa');
        $('.swiper-slide.swiper-slide-active span').addClass('fa-spin fa');
        $('.swiper-slide.swiper-slide-next span').removeClass('fa-spin fa');
        $('.track-station').html(station);
        $('.swiper-slide-active span').css('background','url('+image+') no-repeat').css('background-position','center center').css('background-size','100% 100%');
    }*/

    var playStation = function( url ){
        my_jPlayer.jPlayer("setMedia", {mp3: url});
        my_jPlayer.jPlayer("play");
    }

    var setVolume = function( pos ){
        for( i=1; i <= 5; i++){
            if( i <= pos) {
                $('.vol-selector.vol'+i).css("background-color","#f00");
            }else{
                $('.vol-selector.vol'+i).css("background-color","none");
            }
        }
        var vol = parseInt(pos) / 5;
        my_jPlayer.jPlayer("volume", vol);
    }

    var loadEvents = function(onComplete){
        $.post(Config.serviceJson+"/back/api/web/getevents",
            function(data){                
                var obj= eval(data);
                var html='<ul class="last calendar">';
                for( i=0; i < obj.length; i++){
                    
                    day= obj[i].eventdate.substring(8,10);
                    var months = Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Nov','Dec');
                    month= months[parseInt(obj[i].eventdate.substring(5,7))-1];
                    description= obj[i].description;

                    html+='<li><div class="date"><p><span class="day">'+ day +'</span> <span class="month-name">'+ month +'</span></p></div><div class="title"><p>'+ description +'</p></div></li>';
                }
                html+='</ul>';
                $('#events .over-content').html(html);
                onComplete();
            }
        );
    }

    var loadPartners = function(onComplete){
        $.post(Config.serviceJson+"/back/api/web/getpartners",
            function(data){          
                var obj= eval(data);
                var html='<ul class="photo-grid">';
                for( i=0; i < obj.length; i++){
                    html+='<li><img src="'+ Config.serviceJson+'/back/uploads/partners/'+obj[i].photo+'" /></li>';
                }
                html+='</ul>';
                $('#partners .over-content').html(html);
                onComplete();
            }
        );
    }

    var sendContactForm = function(onComplete){
        var subject = $(".contact-subject").val();
        var message = $(".contact-message").val();

        $.post(Config.serviceJson+"/back/api/web/contact", {'subject': subject, 'message': message },
            function(data){   
                if( data == '1'){
                    $('.contact-subject').css("background-color",'#f00');
                    $('.contact-message').css("background-color",'#f00');
                    $('.contact-subject').css("color",'#fff');
                    $('.contact-message').css("color",'#fff');
                }else if ( data == '2'){
                    $('.contact-subject').css("background-color",'#f00');
                    $('.contact-subject').css("color",'#fff');
                }else if  (data == '3'){
                    $('.contact-message').css("background-color",'#f00');
                    $('.contact-message').css("color",'#fff');
                }else{
                    $('#contact .message').html("Your message has been send.");
                    $('#contact .contact').hide();
                }
            }
        );
    }

    var jPlayerInit= function(){   
        setVolume(5);

        // Change the time format
        $.jPlayer.timeFormat.padMin = false;
        $.jPlayer.timeFormat.padSec = false;
        $.jPlayer.timeFormat.sepMin = ":";
        $.jPlayer.timeFormat.sepSec = "";

        // Initialize the play state text
        //my_playState.text(opt_text_selected);

        // Instance jPlayer
        my_jPlayer.jPlayer({
            ready: function () {
                
            },
            timeupdate: function(event) {
                //my_extraPlayInfo.text(parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%");
                //$('.progressbar .progress').css('width',parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%")
            },
            play: function(event) {
                //my_playState.text(opt_text_playing);
            },
            pause: function(event) {
                //my_playState.text(opt_text_selected);
            },
            ended: function(event) {
               //my_playState.text(opt_text_selected);
            },

            swfPath: "../../dist/jplayer",
            cssSelectorAncestor: "#jp_container",
            supplied: "mp3",
            wmode: "window"
        }); 
    }

    var disksSwiperInit = function(){
        //Disks swiper initialization
        discos = new Swiper('.swiper-container', {
            effect: 'cube',
            grabCursor: true,
            cube: {
                shadow: true,
                slideShadows: false,
                shadowOffset: 30,
                shadowScale: 0.64,
            },
        });
        discos.slideTo(1);
    }

    var loadAdsInterval;
    var changeAds1Interval=0;
    var currentAd1Index=0;
    var changeAds2Interval;
    var currentAd2Index=0;
    var changeAds3Interval;
    var currentAd3Index=0;
    var advertiseManager = function(){
        //Load advertises every 5 minutes and renew the ads list
        loadAdsInterval = setInterval(function(){
            loadAdvertises( function(){} );
        }, Config.loadAdsInterval );

        if(advertises1.length >0 ){
            changeAds1Interval = setInterval(function(){
                currentAd1Index++;
                if( advertises1.length <= currentAd1Index ) currentAd1Index=0;
            } ,Config.changeAds1Interval );
        }

        if(advertises2.length >0 ){
            changeAds2Interval = setInterval(function(){
                currentAd2Index++;
                if( advertises2.length <= currentAd2Index ) currentAd2Index=0;
                refreshAd2();
            } ,Config.changeAds2Interval );
        }

        if(advertises3.length >0 ){
            var duration = advertises3[currentAd3Index].duration;
            if( duration == undefined || duration =="" || duration == 0) duration = Config.changeAds3Interval;
            changeAds3Interval = setInterval(function(){
                currentAd3Index++;
                if( advertises3.length <= currentAd3Index ) currentAd3Index=0;
                refreshAd3();
            } , duration );
        }

        openAdvertise1();
    }

    var refreshAd1 = function(){
        $('.advertise .ad1').css('background','url('+Config.serviceJson+'/back/uploads/thing/'+advertises1[currentAd1Index].photo+') no-repeat').css('background-position','center center').css('background-size','auto 100%');
    }

    var intervalDurationAd2;
    var refreshAd2 = function(){
        //La publicidad 2 se puede definir que desaparezca antes de que cambie hacia la próxima publicidad si
        //Se configura advertises2[currentAd2Index].duration < Config.changeAds2Interval resultando en un espacio
        
        //Cuando aparece la publicidad se detienen todos los discos
        $('.swiper-slide-active span').removeClass('fa-spin fa');
        $('.swiper-slide-next span').removeClass('fa-spin fa');
        $('.swiper-slide-prev span').removeClass('fa-spin fa');
        
        clearInterval(intervalDurationAd2);
        $('.swiper-slide-active span').css('background','url('+Config.serviceJson+'/back/uploads/thing/'+advertises2[currentAd2Index].photo+') no-repeat').css('background-position','center center').css('background-size','auto 100%');
        intervalDurationAd2 = setInterval( function(){
        },advertises2[currentAd2Index].duration );
    }

    var refreshAd3 = function(){
        $('.ad3').attr("href", advertises3[currentAd3Index].url );
        $('.ad3 img').attr("src",Config.serviceJson+'/back/uploads/thing/'+advertises3[currentAd3Index].photo);
        //$('.ad3').css('background','url('+Config.serviceJson+'/back/uploads/thing/'+advertises3[currentAd3Index].photo+') no-repeat').css('background-position','center center').css('background-size','100% auto');
    }

    var advertisesInit = function( ){
        if( geolocate ){ //Las publicidades solo se muestran si hay geolocalización
            showLoader();
            loadAdvertises(function(){ advertiseManager(); hideLoader(); });
        }else{
            openPlayer();
        }
    }
    
    var loadAdvertises = function(onComplete){
        $.post(Config.serviceJson+"/back/api/web/getadvertising", 
            {'latitude':currentLat, 'longitude':currentLong,'userid':currentUserId}, 
            function(data){
                var obj = eval(data);
                for(i=0; i< obj.length; i++ ){
                    if( obj[i].typead == 1) advertises1.push(obj[i]);
                    if( obj[i].typead == 2) advertises2.push(obj[i]);
                    if( obj[i].typead == 3) advertises3.push(obj[i]);
                }
                onComplete();
            }
        );
    }

    var openAdvertise1 =function(){
        //Showing the intro advertise
        var duration = Config.durationIntro;
        if( advertises1[currentAd1Index] != undefined && advertises1[currentAd1Index].duration != undefined ) duration = advertises1[currentAd1Index].duration; 
        refreshAd1();
        adFlag = setInterval(function(){closeAdvertise1();}, duration);
    }

    var closeAdvertise1 = function( ){
        clearInterval(adFlag);
        if(closeAds){
            closeAds=false;
            openPlayer();
        }
    }

    var openPlayer = function(){
        $('.advertise').fadeOut();
        $('.login').fadeOut();
        $('.player').show();
    }

    var openLogin = function(){
        $('.login').show();
        $('.player').hide();
        $('.advertise').hide();
    }

    var closeLogin = function(){
        if( geolocate ){
            advertisesInit();
        }else{
            hideLoader();
            $('.player').show();
            $('.login').fadeOut();
        }
    }

    var sizeAdjustInit = function( ){
        var displayWidth= $( window ).width();
        var heightAux = $('.discos').height();
        var percent = (displayWidth/ heightAux) * 0.9;
        $('.discos').css('transform','scale('+percent+')');
    }

    var showLoader = function(){
        $('.loading').show();
    }

    var hideLoader = function(){
        $('.loading').hide();
    }

    return {
        init: function(){
            disksSwiperInit();
            jPlayerInit();
            getStations();
            initEvents();
            sizeAdjustInit();
       
            showLoader();
            Config.load( function(){
                openFB.init({'appId': Config.fbAppId});
                Utils.getLocation ( function( latitude, longitude ){
                    currentLat= latitude;
                    currentLong= longitude;
                    geolocate = ( currentLat != -1 || currentLong != -1);

                    getUserId( function(userid){
                        currentUserId= userid;

                        if( currentUserId== null ){
                            hideLoader();    
                            openLogin();
                        }else{
                            advertisesInit();
                        }
                    }); 
                });
            });
        }
    }
})();