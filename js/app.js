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
	$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';


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


	



		

});