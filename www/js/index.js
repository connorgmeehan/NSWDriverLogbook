
//Settings
var roundto5 = true;                                        //Rounds minutes to five.
var hosturl = "http://localhost/sdd/php/functions.php";     //I need to switch between webserver and local server
var debug = false;                                           //Used to bypass some code that wont run (can't find location) when there is no intenet avaliable
var tfhour = false;                                         //Twenty four hour = false

//Global Variables
var tripInterval;
var tripLength;
var justtime;
var timeStart;
var timeFinish;
var datetime;
var totalTime;
var currentLocation;
var geoLoc;

$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    //$.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    //pageLayout();
});

function msToTime(s, format) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    if(format == 'hm'){
        return hrs + 'hrs ' + mins + 'm ';
    } else {
        return hrs + 'hrs ' + mins + 'm ' + secs + 's';
    }
}

function displayTime(date){
    console.log("Date is: "+date);
    var hours = date.getHours();
    if(tfhour){
        return date.getHours() + ":" + date.getMinutes();
    } else {
        if(hours<=11){
            return date.getHours() + ":" + date.getMinutes() + "am";
        } else {
            return (date.getHours()-12) + ":" + date.getMinutes() + "pm";
        }
    }
}

function errorMessage(error){
	$("#popupdiv").html("<br><div id='h'><h4>Error Recieved</h4></div><br><p>"+error+"</p>");
	$("#popupdiv").slideDown().delay(2000).slideUp();
}

function getGeoLocation(geoLoc){
    if(!debug){
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        function onSuccess(position){
            console.log(position.coords.longitude+", "+position.coords.latitude);
            $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+position.coords.latitude+","+position.coords.longitude).done(function(data){
                var location = {'suburb': data.results[1].formatted_address,
                            'latlng': (position.coords.latitude)+","+(position.coords.longitude)};
                            console.log(data.results[1].formatted_address);
                return location;
            });
        }
        function onError(error){
            console.log('ERROR FINDING LOCATION');
        }
    } else {
        console.log('Returning the Debugging ver. of getGeoLocation();');
        return '39.93324946484967' + '-80.60202287888436';
    }
}


$(document).ready(function () {
    $("#login").bind("tap", handleLogin);
    $("#register").bind("tap",handleRegister);
    $("#profilesPageButton").bind("tap", getProfiles);
    $("#vehiclesPageButton").bind("tap",getVehicles);
    $("#tripPageButton").bind("tap", function(){
        getProfiles('trippage');
        getVehicles('trippage');
    });
    $("#getTripPage").bind("tap", getTripPage);
    $("#newVehicle").bind("tap", function(){
        $('#newVehiclePopup').slideDown();
    });
    $("#newProfile").bind("tap", function(){
        $('#newProfilePopup').slideDown();
    });
    $('.navbar,.content ui-content,.new').bind('click', function(){
        if($('#newVehiclePopup').css('display') === 'block' || $('#newProfilePopup').css('display') === 'block'){
            $('#newVehiclePopup').slideUp();
            $('#newProfilePopup').slideUp();
        }
    });
    $("#refreshVehicles").bind("tap", getVehicles('vehiclepage'));
    $("#refreshBasicData").bind("tap", basicData);
    $("#saveNewDriver").bind("tap",addProfile);
    $("#saveNewVehicle").bind("tap",addVehicle);
    $("#beginTrip").bind("tap",initTrip);
    $("#finalizeTripButton").bind("tap",function(){
        clearInterval(tripInterval);
        finalizeTrip();
        $.mobile.changePage('#finalizeTripPage');
    });
    $("#completeTripButton").bind("tap", completeTrip);
    $(".cancelTrip").bind("tap", cancelTrip); 
    window.localStorage.setItem("seshstring",""); 
    pageLayout(); 
});

/*                                                                       EDIT DOM FUNCTIONS         */

function pageLayout(){
    //This is to fix some of the jQuery mobile styling paradigms.
    var contentHeight = $(window).height()*0.79;
    $(".content").each(function(index, el) {
        $(this).css({height: contentHeight});
    });
    $(".inlineButtonContainer").each(function(index, el){
        $(this).children('.button').css({
            width: $(window).width()*0.30,
            height: $(window).height()*0.05,
        });
    });
}


/*                                                                       TALK TO SERVER FUNCTIONS */
function handleLogin() {
    $("#submitButton").attr("disabled","disabled");
    var u = $('#email').val();
    var p = $('#password').val();
    

    $.ajax({
            url: hosturl+"?action=login",
            data: {
                email: u,
                password: p,
            },
            type: 'POST',
            success: function(data){
                if(data.length == 20){
                    window.localStorage.setItem("seshstring", data);
                    console.log(window.localStorage.getItem("seshstring"));
                    $('#vehiclePageContainer').html("");
                    $("#profilePageContainer").html("");
                    basicData();
                    $.mobile.changePage('#bastionPage');
                } else {
                    errorMessage("Database Error: " + data);
                }
            },error: function(data){
                errorMessage("Error Connecting to Database: " + data);
            }
        });
}

function handleRegister() {
    $("#registerSubmit").attr("disabled","disabled");
    var newEmail = $("#nEmail").val();
    var newName = 'cbanger';//$("nfName").val();
    var newId = $("#nLNo").val();
    var newPass = $("#nPass").val();
    

    $.ajax({
        url: hosturl+"?action=register",
        data: {
            email: newEmail,
            password: newPass,
            drid: newId,
            fullname: newName,
        },
        type: 'POST',
        success: function(data){
            if(data.length == 20){
                window.localStorage.setItem("seshstring", data);
                console.log(window.localStorage.getItem("seshstring"));
                basicData();
                $.mobile.changePage('#bastionPage');
            }
        },
        error: function(data){

        },
        dataType: 'json',
    });
    basicData();
}

function getVehicles(purpose){
    $.ajax({
        url: hosturl+"?action=getvehicles",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
            narray = data;
            if(purpose=="trippage"){
                $('#selectVehicle').html("");                                // Clears the page so we dont get repeats
                for(var e = 0; e < narray.length; e++) {
                    $('#selectVehicle').append($('<option>', {
                        value: e,
                        text: narray[e].alias,
                    }));
                }
            } else {
                $('#vehiclePageContainer').html("");                          // Clears the page so we dont get repeats
                for (var i = 0; i < narray.length; i++) {
                    template = "<div id='"+i+"'class='listObject'><h4>"+(i+1)+". "+narray[i].alias+"</h4><br><p>"+narray[i].licensenumber+"</p></div>";
                    $('#vehiclePageContainer').append(template);
                    console.log('array: '+narray);
                }
            }
        },
        error: function(data){
            console.log("error"+data);
        },
        dataType: 'json',
    });
}

function getProfiles(purpose){
    var profileArray = [];
    $.ajax({
        url: hosturl+"?action=getprofiles",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
            narray = data;
            console.log('getProfiles Run');
            if(purpose=="trippage"){
                console.log('trip page' + narray);
                narray.forEach(function(el, ind){
                    $('#selectDriver').append($('<option>', {
                        value: ind,
                        text: el.alias,
                    }));
                });
            } else {
                console.log('profilepage');
                $('#profilePageContainer').html(""); // Clears the page
                for (var o = 0; o < narray.length; o++) {
                    template = "<div id='"+o+"'class='listObject'><h4>"+(o+1)+". "+narray[o].alias+"</h4><br><p>"+narray[o].licensenumber+"</p></div>";
                    $('#profilePageContainer').append(template);
                    console.log(narray.alias);
                }   
            }
        },
        error: function(data){
            console.log("error"+data + profileArray);
        },
        dataType: 'json',
    });
}

function addVehicle(name, licenseno){
    $.ajax({
        url: hosturl+"?action=newvehicle",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
            alias: $("#newVehicleName").val(),
            licenseno: $("#newVehicleNumberplate").val(),
        },
        type: 'POST',
        success: function(data){
            narray = data;
             if(purpose=="trippage"){
                console.log('trip page' + narray);
                narray.forEach(function(el, ind){
                    $('#selectVehicle').append($('<option>', {
                        value: ind,
                        text: el.alias,
                    }));
                });
            } else {
                console.log('vehiclepage');
                $('#vehiclePageContainer').html(""); // Clears the page
                for (var o = 0; o < narray.length; o++) {
                    template = "<div id='"+o+"'class='listObject'><h4>"+(o+1)+". "+narray[o].alias+"</h4><br><p>"+narray[o].licensenumber+"</p></div>";
                    $('#vehiclePageContainer').append(template);
                    console.log(narray.alias);
                }   
            }
        },
        error: function(data){
            console.log('alias: '+ $("#newVehicleName").val()+ 'licensenumber'+ $("#newVehicleNumberplate").val());
            console.log("Error Adding New Vehicle: "+data);
        },
        dataType: 'json',
    });
}
function addProfile(name, licenseno){
    $.ajax({
        url: hosturl+"?action=newprofile",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
            alias: $("#newAssiDriverName").val(),
            licenseno: $("#newAssiDriverId").val(),
        },
        type: 'POST',
        success: function(data){
            var narray = getProfiles();
            populateList('profiles', narray);
        },
        error: function(data){
            console.log('error'+data);
        },
        dataType: 'json',
    });
}

function initTrip(){
    function tripLoop(){
        tripLength = new Date()-datetime;
        $("#tripTime").html(msToTime(tripLength));
    }

    //Validation Variables
    //console.log('Initiating trip');
    var chars = /^[0-9]+$/;
    var odoStart = $("#odoStart").val();
    var supervisor = $("#selectDriver").find("option:selected").text();
    var vehicleUsed = $("#selectVehicle").find("option:selected").text();
    datetime = new Date();
    //console.log("Initiating date time: " + datetime);
    odoStart.toString();
    if(odoValid(odoStart)){
        currentLocation = getGeoLocation();
        //console.log(odoStart, supervisor, vehicleUsed, datetime, "position: ", currentLocation);
        console.log('Saving required info to localwindow.localStorage, also trying to change page.');
        window.localStorage.setItem("newTripODO", odoStart); //saves odoStart as newTripODO
        window.localStorage.setItem("newTripS", supervisor);
        window.localStorage.setItem("newTripV", vehicleUsed );
        window.localStorage.setItem("newTripT", datetime);
        window.localStorage.setItem("newGeoLoc", currentLocation);
        $.mobile.changePage('#progressTripPage');
        $("#tripInfo").html("Odometer at Start: "+odoStart+"<br><br>Supervisor: "+ supervisor + "<br><br>Vehicle Used: "+vehicleUsed+"<br><br>");
        tripInterval = setInterval(tripLoop, 1000);//1 second
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

function cancelTrip(){
    console.log('Canceling Trip :(');
    clearInterval(tripInterval);
    window.clearInterval(tripInterval);
    $("#tripTime").html();
}

function finalizeTrip(){
    timeFinish = new Date();
    timeStart = new Date(Date.parse(window.localStorage.getItem("newTripT")));
    totalTime = timeFinish.getTime() - Date.parse(timeStart);
    console.log('TOTAL TIME: '+totalTime);
    currentlocation = getGeoLocation();
    $(document).ajaxStop(function () {
        $("#tripInfo2").html("<h2>Total Time: " + msToTime(totalTime) + "</h2>" +
                        "Odometer at Start: " + window.localStorage.getItem("newTripODO") +
                        "<br><br>" + "Odometer at Finish: <input type='text' id='odoFinish' placeholder='Odometer'>"+
                        "<br><br>" + "Supervisor: " + window.localStorage.getItem('newTripS') +
                        "<br><br>" + "Vehicle Used: " + window.localStorage.getItem('newTripV') + 
                        "<br><br>" + displayTime(timeStart) + " - " + displayTime(timeFinish) + 
                        "<br><br>" + "Starting Position: " + window.localStorage.getItem('newGeoLoc')+ 
                        "<br><br>" + "Finishing Position: " + currentlocation.suburb);
        window.localStorage.setItem('newTripT', timeStart);
        window.localStorage.setItem('newTripTF', timeFinish);
    });
}

function completeTrip(){
    console.log(currentLocation);
    console.log(window.localStorage.getItem("newGeoLoc"));
    odoStart = window.localStorage.getItem("newTripODO");
    odoFinish = $("#odoFinish").val();
    assistantDriver = window.localStorage.getItem('newTripS');
    vehicleUsed = window.localStorage.getItem("newTripV");
    geoLocStart = window.localStorage.getItem("newGeoLoc");
    geoLocFinish = getGeoLocation(); 
    console.log(odoStart+odoFinish+timeStart+timeFinish+assistantDriver+vehicleUsed+geoLocStart+geoLocFinish);

    $("#bastionPage").append('<div id="completedDisplay"><h2>Total Time: ' + msToTime(totalTime) + '</h2>' +
                             '<p><b>Distance: </b>'+odoStart+'km - '+odoFinish+'km</p><br>'+
                             '<p><b>Time: </b>'+displayTime(timeStart)+'-'+displayTime(timeFinish)+'</p><br>'+
                             '<p><b>Supervisor: </b>'+window.localStorage.getItem('newTripS')+'</p><br>'+
                             '<p><b>Vehicle: </b>'+window.localStorage.getItem('newTripV')+'</p><br>'+
                             '<p><b>From: '+geoLocStart.suburb+'<br>  To: '+geoLocFinish.suburb+'</p></b></div>');
    $.mobile.changePage('#bastionPage');
    $("#bastionPage").append('<div id="letter"></div>');
    $("#letter").append('<div id="flap"></div>').css({display: 'block'}).delay(7500).animate({left: 1000}, 1000).delay(1000).queue(function() { $(this).remove(); });
    $("#completedDisplay").css({display: 'block'}).delay(7000).toggle('fold').queue(function() { $(this).remove(); });
    $("#odoStart").val("");

    timeStart = timeStart.toISOString().slice(0, 19).replace('T', ' ');
    timeFinish = timeFinish.toISOString().slice(0, 19).replace('T', ' ');

    $.ajax({
        url: hosturl+'?action=newtrip',
        type: 'POST',
        dataType: 'JSON',
        data: { seshstring: window.localStorage.getItem("seshstring"),
                dbodometerstart: odoStart,
                dbodometerfinish: odoFinish,
                dbtimestart: timeStart,
                dbtimefinish: timeFinish,
                dbsupervisor: assistantDriver,
                dbvehicle: vehicleUsed,
                dbcoordsstart: geoLocStart,
                dbcoordsfinish: geoLocFinish,
                dbtriplength: totalTime},
    })
    .done(function() {
        console.log("Successfully added trip");
    })
    .fail(function() {
        console.log("error");
    });
    basicData();
}

function getTripPage(){
    $.ajax({
        url: hosturl+"?action=gettrips",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
            console.log(data);
            var narray = data;
                                 // Clears the page so we dont get repeats
            for(var e = 0; e < narray.length; e++) {
                narray[e].dbtimestart = narray[e].dbtimestart.slice(11, 19);
                narray[e].dbtimefinish = narray[e].dbtimefinish.slice(11, 19);
                $('#tripListContainer').append('<div class="listObject" id='+e+1+'><h3>'+msToTime(narray[e].dbtotaltime)+
                    '</h3><h6>'+narray[e].dbtimestart+' - '+narray[e].dbtimefinish+
                    '</h6><h5>'+narray[e].dblocfinish+'</h5></div>');
            }
        },
        error: function(data){
            console.log('Error Connecting to server');
        },
        dataType: 'json',
    });
}

function basicData(){
    $.ajax({
        url: hosturl+"?action=basicdata",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
            if(data===null){
                $('#hourText').text('0hrs 0mins');
            } else {
                $('#hourText').text(msToTime(data,'hm'));
            }
        },
        error: function(data){
            console.log('error'+data);
        },
        dataType: 'json',
    });
}
