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


app.controller('Controller', function ($scope, $http) {
	
	//	Set defaults shit for $http
	$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';


	//	Set some defualts for last.fm stuff:
	var api_key = $scope.api_key = '0808b2872e0e3dc09d4530a90deb4418';

	// 	Create a cache object
	var cache = new LastFMCache();

	// Create a LastFM object
	var lastfm = new LastFM({
	  apiKey    : '0808b2872e0e3dc09d4530a90deb4418',
	  apiSecret : '17d41ed2a0967ef14bcd3338f23b8a9c',
	  cache     : cache
	});

	//	Real callback
	// var callbackUrl = $scope.callbackUrl = 'http://himynameisdave.github.io/torrent.fm/';
	//	development callback
	var callbackUrl = $scope.callbackUrl = 'http://localhost:8000/app/index.html';


	//	Dummy data grab for testing
	$http.get('dummydata.json')
	.success(function(data){
		$scope.artists = data;

		//	Handles the "Bio", "Albums", & "Tracks" for each artist car
		$scope.navs = [];	
		//	adds an active nav item to each nav
		for(i=0; i<$scope.artists.length;i++){
			$scope.navs.push({ active : 1 });
		}

	});


	var init = function(){
		//	get a token (if it exists);
		var token = $.url().param('token');

		if(token){

	    	$scope.authorized = true;

			// lastfm.auth.getSession({
		 //    	token: token
			// },
			// {
			//     success: function(data_sess) {
			//     	console.log(data_sess);
			//     	$scope.username = data_sess;
			//     },
			//     error: function(data_sess_error) {
			//     	console.log(data_sess_error);
			//     	$scope.authorized = false;
			//     }
			// });	
			
		}else{



		}

	};

	$(document).ready(init);


	$scope.authUser = function(){
		window.location = 'http://www.last.fm/api/auth/?api_key=' + $scope.api_key + '&cb=' + $scope.callbackUrl;
	};
	

});