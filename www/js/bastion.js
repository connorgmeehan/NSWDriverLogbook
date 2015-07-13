$(document).ready(function(){
	var debugmode = true;
	$("#beginTrip").bind( "tap", initTrip);
});

function initTrip(){
	//Validation Variables
	var chars = /^[0-9]+$/;
	window.odoStart = $("#odoStart").val();
	window.assistantDriver = $("#selectDriver").val();
	window.vehicleUsed = $("#selectVehicle").val();
	window.datetime = new Date();
	console.log(odoStart, assistantDriver, vehicleUsed, datetime);
	odoStart.toString();
	if(odoValid(odoStart)){
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		function onSuccess(){
			window.localstorage.setItem("newTripODO", odoStart); //saves odoStart as newTripODO
			window.localstorage.setItem("newTripAD", assistantDriver);
			window.localstorage.setItem("newTripV", vehicleUsed.value);
			window.localstorage.setItem("newTripT", datetime);
			window.localstorage.setItem("newGeoLoc", position.coords.latitude + position.coords.longitude);
			$.mobile.changePage('#progressTripPage');
			$("#tripTime").html(new Date()-datetime);
			$("#tripInfo").html("Odometer at Start: "+odoStart+"<br>Assistant Driver: "+ assistantDriver + "<br>Vehicle Used: "+vehicleUsed+"");
		}
		function onError(error) {
			var debugmode = true;
        	alert('code: '    + error.code    + '\n' +
        	      'message: ' + error.message + '\n');
        	if(debugmode===true){
        		window.localstorage.setItem("newTripODO", window.odoStart); //saves odoStart as newTripODO
				window.localstorage.setItem("newTripAD", window.assistantDriver);
				window.localstorage.setItem("newTripV", window.vehicleUsed );
				window.localstorage.setItem("newTripT", window.datetime);
				//window.localstorage.setItem("newGeoLoc", position.coords.latitude + position.coords.longitude);
				$.mobile.changePage('#progressTripPage');
				$("#tripTime").html(new Date()-datetime);
				$("#tripInfo").html("Odometer at Start: "+odoStart+"<br>Assistant Driver: "+ assistantDriver + "<br>Vehicle Used: "+vehicleUsed+"");
        	}
    	}
	} else {
		alert("The Odometer Start field needs to have eight characters and must be only numbers.");
	}

	function odoValid(odoValue){
		if(odoValue.length <= 8){
			return true;
		} else {
			return false;
		}
	}

}

function finaliseTrip(){
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
	function onSuccess(){
		odoStart = window.localstorage.getItem("newTripODO");
    	odoFinish = $("#odoFinish").val();
    	timestart = window.localstorage.getItem("newTripT");
    	timefinish = new Date().toString();
    	assistantDriver = window.localstorage.getItem('assistantDriver');
    	vehicleUsed = window.localstorage.getItem("newTripV");
    	geoLocStart = window.localstorage.getItem("newGeoLoc");
    	geoLocFinish = position.coords.latitude + position.coords.longitude;
	}

}

function handleProfiles(){

}

function handleVehicles(){

}
//25767225