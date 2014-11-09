var app=angular.module("app",[]);app.controller("Controller",["$scope","$http","$sce","$log",function(s,t,a,e){s.logNum=1,t.defaults.headers.post["Content-Type"]="application/x-www-form-urlencoded; charset=UTF-8",s.artists=[],s.hasLocalStorage="undefined"!=typeof Storage?!0:!1,s.lastfmSession=!1,s.username="";{var r=s.api_key="0808b2872e0e3dc09d4530a90deb4418",o=new LastFMCache,n=new LastFM({apiKey:r,apiSecret:"17d41ed2a0967ef14bcd3338f23b8a9c",cache:o});s.callbackUrl=document.URL}s.init=function(){if(localStorage.lastfmSession)s.lastfmSession=JSON.parse(localStorage.lastfmSession),s.username=s.lastfmSession.name,s.authorized=!0,localStorage.lastfmRecs?(s.lastfmRecs=JSON.parse(localStorage.lastfmRecs),s.updateCards(s.lastfmRecs)):s.getRecs(s.lastfmSession);else{s.lastfmSession=!1,s.username="";var t=$.url().param("token");n.auth.getSession({token:t},{success:function(t){s.sesson=t.session,s.lastfmSession=t.session,localStorage.lastfmSession=JSON.stringify(t.session),s.username=t.session.name,s.authorized=!0,s.$digest(),s.getRecs(s.lastfmSession)},error:function(s){e.log(s)}})}},s.authUser=function(){window.location="http://www.last.fm/api/auth/?api_key="+s.api_key+"&cb="+s.callbackUrl},s.getRecs=function(t){n.user.getRecommendedArtists({user:s.username,limit:12,page:1},t,{success:function(t){s.recs=t.recommendations,localStorage.lastfmRecs=JSON.stringify(s.recs),s.updateCards(s.recs),s.$digest()},error:function(s){e.log("recs_fail"),e.log(s)}})},s.updateCards=function(t){for($.each(t.artist,function(t,a){var e={},r=a.image.length-1;e.name=a.name,e.img=a.image[r]["#text"],s.artists.push(e),s.$digest()}),s.navs=[],i=0;i<s.artists.length;i++)s.navs.push({active:1});s.$digest(),s.grabInfo()},s.grabInfo=function(){$.each(s.artists,function(a){var r=s.artists[a].name.split(" ").join("+");t.get("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+r+"&api_key="+s.api_key+"&format=json").success(function(t){s.artists[a].bio=t.artist.bio.summary,s.artists[a].bio=s.artists[a].bio.replace(/(<([^>]+)>)/gi,"");var e=200+parseInt($(window).width())/10;s.artists[a].bio=l(s.artists[a].bio,e),s.artists[a].artistLink="http://www.last.fm/music/"+r,s.artists[a].mbid=t.artist.mbid,s.artists[a].tags=[],$.each(t.artist.tags.tag,function(t,e){var r=2;r>=t&&(s.artists[a].tags[t]={},s.artists[a].tags[t].tagName=e.name,s.artists[a].tags[t].tagLink=e.url)}),s.getArtistsTopAlbums(s.artists[a])}).error(function(s){e.log("Error grabbing info: "),e.log(s)})}),s.$digest()},s.getArtistsTopAlbums=function(a){t.get("http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid="+a.mbid+"&api_key="+s.api_key+"&format=json").success(function(s){if(s.error||!s.topalbums)return void e.log(s.message);a.albums=s.topalbums.album;var t=a.name.split(" ").join("+");if(a.albums instanceof Array){a.showAlbums=!0;var r=a.albums.length;for(r>5&&(r=5),a.albumInfo=[],k=0;r>k;k++)a.albumInfo[k]={},a.albumInfo[k].name=a.albums[k].name,a.albumInfo[k].urlname=t+"+"+a.albums[k].name.split(" ").join("+"),a.albumInfo[k].plays=m(a.albums[k].playcount)}else{if(!a.albums)return a.showAlbums=!1,"error";a.showAlbums=!0,a.albumInfo=[{}],a.albumInfo[0].name=a.albums.name,a.albumInfo[0].urlname=t+"+"+a.albums.name.split(" ").join("+"),a.albumInfo[0].plays=m(a.albums.playcount)}return a}).error(function(s){return e.log("Error grabbing albums"),e.log(s),"error"})};var l=function(s,t){var a=$.trim(s).substring(0,t).split(" ").slice(0,-1).join(" ")+"...";return a.replace("&amp;","&").replace("&quot;",'"')},m=function(s){for(;/(\d+)(\d{3})/.test(s.toString());)s=s.toString().replace(/(\d+)(\d{3})/,"$1,$2");return s};$(document).ready(s.init)}]);r numImgs = (v.image.length) - 1;
			
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
				$log.log('Error grabbing info: ');
				$log.log(data);
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
				$log.log(data.message);
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