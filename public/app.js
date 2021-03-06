
////////////////////////
// torrent.fm v.1.1.0 //
////////////////////////

//	Declare our app
var app = angular.module('app', []);


//	Main controller for the app - all JS stuff is in here
app.controller('Controller', ['$scope', '$http', '$sce', '$log', function ($scope, $http, $sce, $log) {

	//	utility: counts which log message it is so that we can 
	//	see the order of things as they are logged
	$scope.logNum = 1;

	//	Set defaults shit for $http
	$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

	//	clear $scope.artists
	$scope.artists = [];

	//	what page of recs we should have loaded
	$scope.recsPage = 1;

	//	quick check to see if the browser supports localStorage
	$scope.hasLocalStorage = ( typeof(Storage) !== "undefined" ) ? true : false;

	//	because as soon as the app loads we want these to be reset
	$scope.lastfmSession = false;
	$scope.username = '';

	//	Set some defualts for last.fm stuff:
	var api_key = $scope.api_key = '0808b2872e0e3dc09d4530a90deb4418';


	// 	Create a cache object (? why - what is this doing and can it be improved)
	var cache = new LastFMCache();
	// Create a LastFM object
	var lastfm = new LastFM({
	  apiKey    : api_key,
	  apiSecret : '17d41ed2a0967ef14bcd3338f23b8a9c',
	  cache     : cache
	});

	//	New callback handles dev and production URLS
	var callback = $scope.callbackUrl = document.URL;


	//	called after the document has fully loaded
	//	contains all the main funcitonality
	$scope.init = function(){

		if ( $scope.hasLocalStorage && localStorage.getItem('recsPage')) {
$l('localStorage exists and also there is a recs page from before');
			$scope.recsPage = localStorage.recsPage;
		}

		//	Okay so this is doing a check to see if we've already stored any lastfm data in localStorage
		if( localStorage.lastfmSession ){		
$l('There is a lastFmSession in localStorage!');
			// grab that old localstorage session of it
			$scope.lastfmSession = JSON.parse( localStorage.lastfmSession );
			//	This is where our username should get retrieved;					
			$scope.username = $scope.lastfmSession.name;
			$scope.authorized = true;					

			if( localStorage.lastfmRecs ){
$l('There is lastfmRecs localStorage!');
				$scope.lastfmRecs = JSON.parse( localStorage.lastfmRecs );
		    	$log.log($scope.lastfmRecs);
		    	$scope.updateCards($scope.lastfmRecs);

			}else{
$l('There is no lastfmecs in localStorage!');
				$scope.getRecs($scope.lastfmSession);
			}

		}else{
$l('There is no lastfmSession in localStorage!');
			$scope.lastfmSession = false;
			$scope.username = '';

			//	get a token (if it exists);
			var token = $.url().param('token');
		
			lastfm.auth.getSession({
		    	token: token
			},
			{
			 	success: function(data_sess) {
$l('Successfully retrieved a lastfm session');

			    	$scope.sesson = data_sess.session

			    	$scope.lastfmSession = data_sess.session;
			    	localStorage.lastfmSession = JSON.stringify(data_sess.session);	
					// localStorage.lastfmSession.name = data_sess.session.name;
					$scope.username = data_sess.session.name;
			    	$scope.authorized = true;
$l($scope.username);
			    	$scope.$digest();		
			    	$scope.getRecs($scope.lastfmSession);

			    },
			    error: function(data_sess_error) {
$l('error retrieving lastfmSession!');
			    	console.log(data_sess_error);
			    }
			});	

		}//ifelse localStorage

	};


	///		WHY IS THIS NEXT FUNCTION USED!?  	//
	$scope.authUser = function(){
		window.location = 'http://www.last.fm/api/auth/?api_key=' + $scope.api_key + '&cb=' + $scope.callbackUrl;
	};


	$scope.getRecs = function(sesh){
$l('getRecs called!');
		if(sesh === 'gimmieMore'){
			sesh = $scope.lastfmSession;
		}
		var limit = 12;
		// if($scope.recsPage < 3){ limit = 12; }
		// if($scope.recsPage >= 3 && $scope.recsPage < 6 ){ limit = 6; }
		// if($scope.recsPage >= 6 ){ limit = 4; }

		//	Here's the part where ya check if their recs already been loaded.
		lastfm.user.getRecommendedArtists({
		    user: 	$scope.username,
		    limit: 	limit,
		    page: 	$scope.recsPage
		},
		  	sesh,
		{
		    success: function(data_recs) {
$l('Successfully got recs!!');
				$scope.recsPage++;
		    	$scope.recs = data_recs.recommendations;

		    	if( localStorage.getItem('lastfmRecs') ){
		    		var hmstrngs = JSON.parse(localStorage.lastfmRecs);
					$.each($scope.recs.artist, function(k, val){
						hmstrngs.artist.push(val);
					})
					localStorage.lastfmRecs = JSON.stringify(hmstrngs);
					localStorage.recsPage = $scope.recsPage;
		    	}else{
					localStorage.lastfmRecs = JSON.stringify($scope.recs);	    	
		    	}
		    	$scope.updateCards($scope.recs);
		    	$scope.$digest();
// $l($scope.artists);
		    },
		    error: function(data_recs_error) {
$l('Failed to get recs!!');
		    	console.log('recs_fail');
		    	console.log(data_recs_error);
		    }
		});//End getRecs
	};

	$scope.updateCards = function(recs){

		// console.log(recs.artist)
		$.each(recs.artist, function(i,v){

			var newArtist = {};
			newArtist.name = v.name;
				
			var numImgs = (v.image.length) - 1;
			newArtist.img = v.image[numImgs]['#text'];

			$scope.artists.push(newArtist);
			$scope.$digest()

		})
	 	//	Handles the "Bio", "Albums", & "Tracks" for each artist car
		$scope.navs = [];	
		//	adds an active nav item to each nav
		for(i=0; i<$scope.artists.length;i++){
			$scope.navs.push({ active : 1 });
		}
		$scope.$digest()
		$scope.grabInfo();
	};

	$scope.grabInfo = function(){
		$.each($scope.artists, function(i,v){
			var urlName = $scope.artists[i].name.split(' ').join('+');
			$http.get('http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist='+urlName+'&api_key='+$scope.api_key+'&format=json')
			.success(function(data){
				//	Gets the shorter bio, html tags and all
				$scope.artists[i].bio = data.artist.bio.summary;
				//	regEx that gets rid of the HTML tags (thanks CSS Tricks!)
				$scope.artists[i].bio = $scope.artists[i].bio.replace(/(<([^>]+)>)/ig,"");
				//	This is a rough way to guage how much of the bio to snip (based on browser width)
				//	TODO: watch window resize and update bio truncation on resize
				var bioSize = 200 + parseInt($( window ).width())/10; 
				//	
				$scope.artists[i].bio = truncateBio( $scope.artists[i].bio, bioSize )
				$scope.artists[i].artistLink = "http://www.last.fm/music/" + urlName;
				$scope.artists[i].mbid = data.artist.mbid;

				$scope.artists[i].tags = [];
				$.each(data.artist.tags.tag, function(j, value){
					// var numberOfTagsDisplayed = data.artist.tags.tag.length;
					var numberOfTagsDisplayed = 3 - 1;//minus 1 cuz it's <=

					if(j <= numberOfTagsDisplayed ){
						$scope.artists[i].tags[j] = {};
						$scope.artists[i].tags[j].tagName = value.name;
						$scope.artists[i].tags[j].tagLink = value.url
					}
				});


				$scope.getArtistsTopAlbums($scope.artists[i]);
			})
			.error(function(data){
				console.log('Error grabbing info: ');
				console.log(data);
			})
		});
		$scope.$digest();
		// console.log($scope.artists);
	};


	$scope.getArtistsTopAlbums = function(artist){

		$http.get('http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid='+artist.mbid+'&api_key='+$scope.api_key+'&format=json')
		.success(function(data){

			if(!data.error && data.topalbums){
				artist.albums = data.topalbums.album;
			}else{
				//	TODO: this should change the "hasAlbums" text to "No Albums to Display!"
				console.log(data.message);
				return;
			}

			var artistUrlName = artist.name.split(' ').join('+');

			if( artist.albums instanceof Array ){

				artist.showAlbums = true;
				
				var limit = artist.albums.length;
				if(limit > 5){ limit = 5; };

				artist.albumInfo = [];
				for(k=0; k<limit; k++){
					artist.albumInfo[k] = {};
					artist.albumInfo[k].name 	= artist.albums[k].name;
					artist.albumInfo[k].urlname  = artistUrlName + '+' + artist.albums[k].name.split(' ').join('+');
					artist.albumInfo[k].plays 	= commaSeparateNumber(artist.albums[k].playcount);
				};		

			}else if(artist.albums){

				artist.showAlbums = true;
				artist.albumInfo = [{}];
				artist.albumInfo[0].name 		= artist.albums.name;
				artist.albumInfo[0].urlname 	= artistUrlName + '+' + artist.albums.name.split(' ').join('+');
				artist.albumInfo[0].plays 		= commaSeparateNumber(artist.albums.playcount);
				
			}else{
				artist.showAlbums = false;
				return 'error';
			}
			// $scope.$digest();
			return artist;
		})	
		.error(function(data_error){
			$log.log('Error grabbing albums');
			$log.log(data_error);
			return 'error';
		})
	};

	//////////////////////////////////////////////
	//			  UTILITY FUNCTIONS				//
	//////////////////////////////////////////////

	var $l = function(msg){
		console.log( '~~~~~~~~  ' + $scope.logNum + '  ~~~~~~~~');
		console.log(msg);
		console.log( '=====================');

		var t = $('#devlog p.console').html();
		$('#devlog p.console').html(t + $scope.logNum + '| ' + msg + '<br/>');
		$scope.logNum++;
	};

	$scope.clearLocalStorage = function(){
		localStorage.clear();
		location.reload();
	};

	//	This takes the bio and shortens it and adds a sweet 'read more' link to it.
	var truncateBio = function(str, size){
		var trim = $.trim(str).substring(0, size).split(" ").slice(0, -1).join(" ") + "...";
		return trim.replace("&amp;", "&").replace("&quot;", "\"");
	};	

	//	add commas to the playcounts using this
	//	Thanks, StackOverflow community: http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
	var commaSeparateNumber = function(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  }


	//	Call init when the document has loaded
	$(document).ready($scope.init);

}]);