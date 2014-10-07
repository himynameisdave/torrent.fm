//	Written by Dave Lunny
var app = angular.module('app', ['ui.router']);


app.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise("/");

	$stateProvider
	    .state('home', {
	      url: "/",
	      templateUrl: "partials/view.html",
	      controller: "Controller"
	    })
});


app.controller('Controller', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
	
	//	Set defaults shit for $http
	$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

	//reset $scope.artists
	$scope.artists = [];

	if(typeof(Storage) !== "undefined") {	
		$scope.hasLocalStorage = true;
	} else {
		$scope.hasLocalStorage = false;
	}

	$scope.lastfmSession = false;
	$scope.username = '';

	//	Set some defualts for last.fm stuff:
	var api_key = $scope.api_key = '0808b2872e0e3dc09d4530a90deb4418';

	// 	Create a cache object
	var cache = new LastFMCache();

	// Create a LastFM object
	var lastfm = new LastFM({
	  apiKey    : api_key,
	  apiSecret : '17d41ed2a0967ef14bcd3338f23b8a9c',
	  cache     : cache
	});

	//	Real callback
	var callbackUrl = $scope.callbackUrl = 'http://himynameisdave.github.io/torrent.fm/';
	//	development callback
	// var callbackUrl = $scope.callbackUrl = 'http://localhost:8000/app/index.html';


	$scope.init = function(){

		if( localStorage.lastfmSession ){	
			// console.log('');

			$scope.lastfmSession = JSON.parse( localStorage.lastfmSession );
			$scope.username = localStorage.lastfmSession.name;

			if( localStorage.lastfmRecs ){
				$scope.lastfmRecs = JSON.parse( localStorage.lastfmRecs );
		    	$scope.updateCards($scope.lastfmRecs);

			}else{
				$scope.getRecs($scope.lastfmSession);
			}

		}else{

			$scope.lastfmSession = false;

			var token;
			$scope.username = '';

			//	get a token (if it exists);
			var token = $.url().param('token');
		
			lastfm.auth.getSession({
		    	token: token
			},
			{
			 	success: function(data_sess) {
			    	// console.log('success auth');

			    	$scope.sesson = data_sess.session

			    	$scope.lastfmSession = data_sess.session;
			    	localStorage.lastfmSession = JSON.stringify(data_sess.session);

			    	$scope.username = data_sess.session.name;
			    	$scope.$digest();		

			    	$scope.getRecs($scope.lastfmSession);

			    },
			    error: function(data_sess_error) {
			    	console.log('error!');
			    	console.log(data_sess_error);
			    }
			});	

		}//ifelse localStorage

	};



	$scope.authUser = function(){
		window.location = 'http://www.last.fm/api/auth/?api_key=' + $scope.api_key + '&cb=' + $scope.callbackUrl;
	};

	$scope.getRecs = function(sesh){
		console.log('#1 - getRecs called');

		console.log('#2 - $scope.lastfmSession: ' + $scope.lastfmSession);
		
		//	Here's the part where ya check if their recs already been loaded.
		lastfm.user.getRecommendedArtists({
		    user: 	$scope.username,
		    limit: 	12,
		    page: 	1
		},
		  	sesh,
		{
		    success: function(data_recs) {
		    	// console.log(data_recs);
		    	$scope.recs = data_recs.recommendations;
				localStorage.lastfmRecs = JSON.stringify($scope.recs);	    	
		    	$scope.$digest();
		    },
		    error: function(data_recs_error) {
		    	console.log('recs_fail');
		    	console.log(data_recs_error);
		    }
		});//End getRecs
	};

	$scope.updateCards = function(recs){

		// console.log(recs.artist)

		$.each(recs.artist, function(i,v){

			var newArtist = {};
			var numImgs = (v.image.length) - 1;
			
			newArtist.name = v.name;
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
				// console.log(data);
				$scope.artists[i].bio = data.artist.bio.summary;
				$scope.artists[i].bio = $sce.trustAsHtml($scope.artists[i].bio);
				$scope.artists[i].mbid = data.artist.mbid;

				$scope.artists[i].tags = [];
				$.each(data.artist.tags.tag, function(j, value){
					if(j < 3){
						$scope.artists[i].tags[j] = value.name;
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
					artist.albumInfo[k].plays 	= artist.albums[k].playcount;
				};		

			}else if(artist.albums){

				artist.showAlbums = true;
				artist.albumInfo = [{}];
				artist.albumInfo[0].name 		= artist.albums.name;
				artist.albumInfo[0].urlname 	= artistUrlName + '+' + artist.albums.name.split(' ').join('+');
				artist.albumInfo[0].plays 		= artist.albums.playcount;

			}else{
				artist.showAlbums = false;
				return 'error';
			}
			// $scope.$digest();
			return artist;
		})	
		.error(function(data_error){
			console.log('Error grabbing albums');
			console.log(data_error);
			return 'error';
		})
	};

	$(document).ready($scope.init);

}]);