var App = (function(){
    
    var adFlag=0;
    var closeAds=true;
    var discos;
    var advertises1 = new Array();
    var advertises2 = new Array();
    var advertises3 = new Array();

    var bodyEl = document.body,
        content = document.querySelector( '.content-wrap' ),
        openbtn = document.getElementById( 'open-button' ),
        openbtn2 = document.getElementById( 'open-button-secondary' ),
        closebtn = document.getElementById( 'close-button' ),
        closebtn2 = document.getElementById( 'close-button-secondary' ),
        isOpen = false,

        morphEl = document.getElementById( 'morph-shape' ),
        s = Snap( morphEl.querySelector( 'svg' ) );
        path = s.select( 'path' );
        initialPath = this.path.attr('d'),
        pathOpen = morphEl.getAttribute( 'data-morph-open' ),
        isAnimating = false;

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

    var mask = function(){
        var mask03 = $('.sobre_03');
        var total = $(window).width();
        mask03.width( total - 119 )
    };

    var hideThumbs = function(){
        $('.dislike').click( function(){
            $('.like').addClass('disliked');
        })
        $('.like').click( function(){
            $('.dislike').addClass('liked');
        })
    };

    var heart = function(clase){
        $(clase).on({
            click: function(){
                $(this).toggleClass('clicked');
                $('.pulse', this).addClass('activo');
                setTimeout( function(){ $('.pulse').removeClass('activo'); }, 1000 );
            },
        })
    };

    var toggleMenu =  function() {
        if( isAnimating ) return false;
        isAnimating = true;
        if( isOpen ) {
            $('body').removeClass( 'show-menu' );
            setTimeout( function() {
                // reset path
                path.attr( 'd', initialPath );
                isAnimating = false;
            }, 300 );
        }
        else {
            $('body').addClass( 'show-menu' );
            // animate path
            path.animate( { 'path' : pathOpen }, 400, mina.easeinout, function() { isAnimating = false; } );
        }
        isOpen = !isOpen;
    }

    var toggleMenu2 =  function() {
        if( isAnimating ) return false;
        isAnimating = true;
        if( isOpen ) {
            $('body').removeClass( 'show-menu-secondary' );
            // animate path
            setTimeout( function() {
                // reset path
                path.attr( 'd', initialPath );
                isAnimating = false;
            }, 300 );
        }
        else {
            $('body').addClass( 'show-menu-secondary' );
            // animate path
            path.animate( { 'path' : pathOpen }, 400, mina.easeinout, function() { isAnimating = false; } );
        }
        isOpen = !isOpen;
    }

    var closeLogin = function(){
        $('.player').show();
        $('.login').fadeOut();
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
        $.post(Config.serviceJson+"/back/api/web/getstations", function(data){
            var stations="";
            var obj = eval(data);

            $.each(obj, function(key, value){
                stations +='<a href="' + value.url + '" class="playstation" data-name="'+value.name+'" data-image="'+Config.serviceJson+'/back/uploads/'+value.diskimage+'"><span>' + value.name + '</span><img src="'+Config.serviceJson+'/back/uploads/stations/' + value.photo + '" /></a>';
            
                tracks = '<div class="swiper-slide" data-image="'+Config.serviceJson+'/back/uploads/'+value.diskimage+'" data-name="'+value.name+'" data-station="'+value.url+'"><span style="background-image: url('+Config.serviceJson+'/back/uploads/'+value.diskimage+');border: solid 2px #FFFFFF;"></span></div>';
                discos.appendSlide(tracks);
           
            });

            $('.radios').append(stations);
        });
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

    var initEvents = function(){

        $('.nextsong').click(function(e){
            e.preventDefault();
            discos.slideNext(true,500);
        });

        $('.prevsong').click(function(e){
            e.preventDefault();
            discos.slidePrev(true,500);
        });

        openbtn.addEventListener( 'click', toggleMenu );
        if( closebtn ) {
            closebtn.addEventListener( 'click', toggleMenu );
        }

        // close the menu element if the target it´s not the menu element or one of its descendants..
        content.addEventListener( 'click', function(ev) {
            var target = ev.target;
            if( isOpen && target !== openbtn ) {
                toggleMenu();
            }
        } );

        openbtn2.addEventListener( 'click', toggleMenu2 );
        if( closebtn2 ) {
            closebtn2.addEventListener( 'click', toggleMenu2 );
        }

        // close the menu element if the target it´s not the menu element or one of its descendants..
        content.addEventListener( 'click', function(ev) {
            var target = ev.target;
            if( isOpen && target !== openbtn ) {
                toggleMenu2();
            }
        } );

        $(".menu-wrap .back").click(function(){
            toggleMenu();
        }); 

        $(".menu-wrap-secondary .back").click(function(){
            toggleMenu2();
        });

        $(".advertise .close-button").click(function(){
            closeAdvertise1();
        });  

        $(".login .close-button").click(function(){
            $(".login").fadeOut();
        }); 
        
        $("#contact .close-button").click(function(){
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

        $(".login .submit").click(function(){
            var email = $('.login #mail').val();
            var nombre = $('.login #nombre').val();
            var telefono = $('.login #telefono').val();
            var apellido = $('.login #apellido').val();
            
            $.post(Config.serviceJson+"/back/api/web/registroapp",
                {'mail':email,'name':nombre,'lastname':apellido,'telephone':telefono,'lat':currentLat,'long':currentLong},
                function(data){
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

        $('.vol-selector').click(function(e){
            e.preventDefault();
            var pos =$(this).data('vol');
            for( i=1; i <= 5; i++){
                if( i <= pos) {
                    $('.vol-selector.vol'+i).css("background-color","#f00");
                }else{
                    $('.vol-selector.vol'+i).css("background-color","none");
                }
            }
            var vol = parseInt($(this).data('vol')) / 5;
            my_jPlayer.jPlayer("volume", vol);
        });

        // Create click handlers for the different tracks
        $(".jp-play").click(function(e) {
            e.preventDefault();
            playUrl($('.swiper-slide.swiper-slide-active').data('station'),$('.swiper-slide.swiper-slide-active').data('name'),$('.swiper-slide.swiper-slide-active').data('image'));
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

        discos.on('slideChangeEnd', function () {
           playUrl($('.swiper-slide.swiper-slide-active').data('station'),$('.swiper-slide.swiper-slide-active').data('name'),$('.swiper-slide.swiper-slide-active').data('image'));
        });

        $('body').on('click',".playstation", function(e) {
            e.preventDefault();
                
            //Buscando el slide que debo mostrar 
            var i=0;
            var name= $(this).data('name');
            $('.swiper-slide').each(function( index ) {
                if( $(this).data('name') == name ){ i=index;}
            });
            discos.slideTo(i, 500, false);

            playUrl($(this).attr("href"),$(this).data('name'),$(this).data('image'));

        });

        $('a.mix-over').click(function(e){
            e.preventDefault();
            
            toggleMenu();

            if($(this).attr('href') == "#events") {
                loadEvents(function(){
                    $('.page').not('.player,#events').attr("class","page transition right");
                    $('#events').attr("class","page transition center");
                });
            }else if($(this).attr('href') == "#partners") {
                loadPartners(function(){
                    $('.page').not('.player,#partners').attr("class","page transition right");
                    $('#partners').attr("class","page transition center");
                });
            }else{
                $('.page').not('.player,'+$(this).attr('href')).attr("class","page transition right");
                $($(this).attr('href')).attr("class","page transition center");
            }
        });

        $(".page .close-button").click(function(){
            $(this).parent().attr("class","page transition right");
        });  

        $(".contact-submit").click(function(){
            sendContactForm();
        })

        $('.inappbrowser').click(function(e){
            e.preventDefault();
            var ref = window.open($(this).attr('href'), '_blank', 'location=yes');
        });
    }

    var playUrl = function( url, station, image ){
        $('.swiper-slide.swiper-slide-prev span').removeClass('fa-spin fa');
        $('.swiper-slide.swiper-slide-active span').addClass('fa-spin fa');
        $('.swiper-slide.swiper-slide-next span').removeClass('fa-spin fa');

        $('.track-station').html(station);

        $('.swiper-slide-active span').css('background','url('+image+') no-repeat').css('background-position','center center').css('background-size','100% 100%');

        my_jPlayer.jPlayer("setMedia", {
            mp3: url
        });
        my_jPlayer.jPlayer("play");

        $(this).blur();
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

        // Change the time format
        $.jPlayer.timeFormat.padMin = false;
        $.jPlayer.timeFormat.padSec = false;
        $.jPlayer.timeFormat.sepMin = ":";
        $.jPlayer.timeFormat.sepSec = "";

        // Initialize the play state text
        my_playState.text(opt_text_selected);

        // Instance jPlayer
        my_jPlayer.jPlayer({
            ready: function () {
                $(".track-default").click();
            },
            timeupdate: function(event) {
                my_extraPlayInfo.text(parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%");
                //$('.progressbar .progress').css('width',parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%")
            },
            play: function(event) {
                my_playState.text(opt_text_playing);
            },
            pause: function(event) {
                my_playState.text(opt_text_selected);
            },
            ended: function(event) {
                my_playState.text(opt_text_selected);
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
       loadAdvertises(function(){ advertiseManager() });
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
            getUserId( function(userid){
                if( userid != null ){
                    $('.login').hide();
                    $('.player').show();
                }else{
                    $('.login').show();
                    $('.player').hide();
                }
                $('.advertise').fadeOut();
            });
        }
    }

    return {
        init: function(){

            disksSwiperInit();
            mask();
            heart('.heart, .like, .dislike');
            hideThumbs();

            Config.load( function(){
                
                openFB.init({'appId': Config.fbAppId});

                Utils.getLocation ( function( latitude, longitude ){
                    currentLat= latitude;
                    currentLong= longitude;
                    getUserId( function(userid){
                        currentUserId= userid;
                        advertisesInit();
                        //checkChannels();
                        getStations();
                        initEvents();
                        jPlayerInit();
                    });

                });
            });
        
        }
    }
})();