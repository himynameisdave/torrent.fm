//	Written by Dave Lunny

function		init()		{
	
	$("#submitBtn").on('click', function(){
		
		//un means username
		var un = $("#userInput").val();
		
		validateUsername(un);
			
	});
	
	
};//	End init function


function validateUsername(un)	{
	
	if(un == ""){
		issueErrorMsg("You did not enter a last.fm username!");	
	}else{
	
		//	GUI= getUserInfoRequest
		var GUIRequest = "http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user="+un+"&api_key=e4a0ac2c8af6c37e056910f89318b9b4";
		
		var xmlHttpReq =new XMLHttpRequest();
		xmlHttpReq.open("GET",GUIRequest,false);
		xmlHttpReq.send();
		xmlDoc=xmlHttpReq.responseXML;
		
		try{ 
			anyErrors = xmlDoc.getElementsByTagName("error")[0].childNodes[0].nodeValue; 		
			issueErrorMsg(anyErrors);	
		}
		catch(err){
			getMeSomeAlbums(un);
		}
						
	};//End if else if its empty

};//End validateUsername fucntion


function issueErrorMsg(errorMsg){
	alert("ERROR!   " + errorMsg);
};


function getMeSomeAlbums(username){
	
	$("div.wrap").empty();	
	
	var datRequest = "http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user="+username+"&period=7day&api_key=e4a0ac2c8af6c37e056910f89318b9b4";
	
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else {// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.open("GET",datRequest,false);
	xmlhttp.send();
	xmlDoc=xmlhttp.responseXML;
	
	var albums = xmlDoc.getElementsByTagName("album");
	var j = 0;
	var hundoP;	
	var appendContent = '';

	var datSafetyNet = setInterval(function(){
		
		if(j < 25){
			
			var albumName = albums[j].getElementsByTagName("name")[0].childNodes[0].nodeValue;
			var artistName= albums[j].getElementsByTagName("artist");
			var artist    = artistName[0].getElementsByTagName("name")[0].childNodes[0].nodeValue;
			var image		= albums[j].getElementsByTagName("image")[2].childNodes[0].nodeValue;
			
			appendContent += "<div class='box'><div class='boxInner'><img src='"+image+"' /><div class='titleBox'><a href='https://www.google.ca/#q="+artist+"+"+albumName+"+torrent'>"+albumName+"</a></div> </div></div>"
			
			j++
			
		}else{
			clearInterval(datSafetyNet);
			appender(appendContent);
		};
		
	}, 200);

	function appender(apCont){
		//quick set .renderbox to not be opaque
		$('.renderbox').css('opacity','1');
		$('div.wrap').append(apCont);
	};	

	
};//end getMeSomeAlbums()


$(document).ready(init);