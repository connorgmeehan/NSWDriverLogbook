
//Settings                                                      
var hosturl;                                                    //I need to switch between webserver and local server
var debug = false;                                              //Used to bypass some code that wont run (can't find location) when there is no intenet avaliable
var tfhour = false;                                             //Twenty four hour = false
var distributable = true;                                      //Switches between local server and liver server
var doingTutorial = false;

//Global Variables
var tripInterval;
var tripLength;
var timeStart;
var timeFinish;
var timeStart;
var totalTime;
var currentLocation;
var previousLocation;

$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;
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

function getGeoLocation(){
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    function onSuccess(position){
        console.log(position.coords.longitude+", "+position.coords.latitude);
        $.ajax({
            url: "https://maps.googleapis.com/maps/api/geocode/json?latlng="+position.coords.latitude+","+position.coords.longitude,
            dataType: 'json',
            async: false,
            success: function(data) {
                var locationArray =[data.results[1].formatted_address, position.coords.latitude+","+position.coords.longitude];
                console.dir(locationArray);
                currentLocation = locationArray;
            }
        });
    }
    function onError(error){
        console.log('ERROR FINDING LOCATION');
    }
}

$(document).ready(function () {
    if(localStorage.getItem('notFirstTime') != true  ){
        $.mobile.changePage('#registerPage');
        localStorage.setItem('notFirstTime', true);
        console.log('notFirstTime: '+ localStorage.getItem('notFirstTime'));
        queryUser("Hey, looks like it's your first time using the Driver Logbook app, would you like to load up the tutorial?", function(){tutorial('register');}, function(){$('#popupdiv').slideUp();});
    }
    localStorage.setItem('notFirstTime', undefined);

    if(distributable){
        hosturl = "http://25767225.99atarplease.com/sdd/php/functions.php";
    } else {
        hosturl = "http://localhost/sdd/php/functions.php";
    }

    pageLayout(); 

    bindButtons();
    //$('#loadingmask').fadeOut(500, function(){ $(this).remove(); });
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*                                                      Page Constructors       */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function tutorial(type){
    console.log('Running Tutorial');
    doingTutorial = true;
    function emulateText(target, content){
        console.log('Filling a form')
        $(target).val('');
        var stringToApply = "";
        var length = content.length;
        var index = 0
        var stringToAdd
        setInterval(editString,50);
        function editString(){
            if(index < length){
                //console.log('adding to string brah' + stringToApply + content);
                stringToAdd = content.slice(index, index+1);
                stringToApply = stringToApply + stringToAdd;
                index = index + 1;
                $(target).val(stringToApply);
            } else {
                clearInterval(editString);
            }
        }
    }
    switch(type){
        case 'register':
            $('#tutorialmask').css({'display':'block'});
            $.mobile.changePage('#registerPage');
            relayMessage('First we must register an account, fill in the boxes like so.',3000);
            setTimeout(function(){
                console.log('setp one')
                emulateText('#nEmail','yourname@provider.com');
                setTimeout(function(){
                    emulateText('#nfName','John Doe');
                    setTimeout(function(){
                        emulateText('#nLNo', '13572468');
                        setTimeout(function(){
                            emulateText('#nPass', 'password');
                            setTimeout(function(){
                                emulateText('#rNPass', 'password');
                                setTimeout(function(){
        /*ILLUMINATI*/              queryUser('Make an account! Ready to do the same?', function(){
                                        $('#rNPass,#nPass,#nLNo,#nfName,#nEmail').val('');
                                        $('#tutorialmask').css({'display':'none'});
                                        $('#popupdiv').slideUp();
                                     },function(){
                                        tutorial('register');
                                    });
                                }, 1500);
                            }, 1500);
                        }, 1500);
                    }, 1500);
                }, 1500);
            },1500);
            break;
        case 'login':
            relayMessage('Ok, now enter your email and password into these fields.',3000);
            break;
        case 'supervisor':
            $('#tutorialmask').css({'display':'block'});
            $('#profilesPageButton').click();
            relayMessage('First we must add a profile for a supervisor that will supervise your driving.<br> We do this by clicking on the (+) plus button in the bottom right corner.',6000);
            setTimeout(function(){
                $('#profilesPageButton').click();
                setTimeout(function(){
                    $('#newProfilePopup').slideDown();
                    $('#newProfile').css({'background-colour':'white'}).delay(400).css({'background-colour': '#D13F32'});
                    setTimeout(function(){
                        emulateText('#newAssiDriverName','Mum');
                        setTimeout(function(){
                            emulateText('#newAssiDriverId','21415697');
                            queryUser("And then click ok.  Can you do the same with your supervisor's information?",function(){
                                $('#newAssiDriverId,#newAssiDriverName').val('');
                                $('#tutorialmask').css({'display':'none'});
                                $('#newProfilePopup').slideUp();
                            }, function(){
                                $('#newAssiDriverId,#newAssiDriverName').val('');
                                tutorial('supervisor');
                            },3500);
                        },1500);
                    },2500);
                },4000);
            },4000);
            break;
        case 'vehicle':
            $('#tutorialmask').css({'display':'block'});
            setTimeout(function(){
                relayMessage("Next we'll add a vehicle that you will be driving.<br>We'll click on the add new button again",3000);
                $('#vehiclesPageButton').click();
                setTimeout(function(){
                    $('#newVehiclePopup').slideDown();
                    setTimeout(function(){
                        emulateText('#newVehicleName','Holden Accord');
                        setTimeout(function(){
                            emulateText('#newVehicleNumberplate','BZD39P');
                            queryUser("And then click ok.  Can you do the same with your vehicles's information?",function(){
                                $('#newVehicleNumberplate,#newVehicleName').val('');
                                $('#tutorialmask').css({'display':'none'});
                            }, function(){
                                $('#newVehicleNumberplate,#newVehicleName').val('');
                                $('#newProfilePopup').slideUp();
                                tutorial('vehicle');
                            });
                        },4000);
                    },2500);
                },4000);
            },4000);
            break;
        case 'newtrip':
            $('#tutorialmask').css({'display':'block'});
            relayMessage("Now we can start a trip.  I'll click on the Start Trip button for you.",4000);
            setTimeout(function(){
                $('#tripPageButton').click();
                setTimeout(function(){
                    relayMessage("Now we must enter the odometer of the car you are using(in kilometres).  <br> It can't contain fullstops.",5000);
                    setTimeout(function(){
                        emulateText('#odoStart','23,560');
                        relayMessage("And then we click Begin Trip").
                        queryUser("Can you do the same with your car's odometer?",function(){
                            $('#tutorialmask').css({'display':'none'});
                            $('#odoStart').val('');
                        }, function(){
                            tutorial('newtrip');
                            $('#odoStart').val('');
                        });
                    },5000);
                },2000);
            },3000);   
            break;
        case 'finalizetrip':
            $('#tutorialmask').css({'display':'block'});
            relayMessage("Ok, now that we've started a trip, I'll show you how to finalize one.")
            setTimeout(function(){
                $('#tutorialmask').css({'display':'none'});
                relayMessage("Just add the finishing odometer, make sure the information is ok and click finalize trip.   <br> Don't worry, this is just a demo and won't be saved. ");
            },3500);
            break;
        case 'finish':
            relayMessage('Congratulations, you just <b>pretend<b> did your first Driver Logbook trip. <br> Thanks, from Connor Meehan')
        default:
            errorMessage("I don't even know how you got here but you broke it... <br> Please email ***@****.*** and tell me what went wrong and I'll get right on it.");
            break;
    }
}
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

function errorMessage(error){
    $("#popupdiv").html("<div id='h'><h4>Error Recieved</h4></div><br><p>"+error+"</p>");
    $("#popupdiv").css({'background-colour':'#DEDBA7'}).slideDown().delay(3500).slideUp();
    console.log('ERR:  '+error);
}
function relayMessage(message, delay){
    $("#popupdiv").html("<br><p>"+message+"</p>");
    $("#popupdiv").css({'background-colour':'#00A388'}).slideDown().delay(delay).slideUp();
    console.log('MSG:  '+message);
}
function queryUser(query,yesaction,noaction){
    $("#popupdiv").html("<br><p>"+query+"</p><br><div class='queryButtonContainer'><a class='button' id='accept'>Ok</a></div><div class='queryButtonContainer'><a class='button' id='decline'>No Thanks</a></div>");
    $("#popupdiv").css({'background-colour':'#ACF0F2'}).slideDown();
    $("#accept").bind("tap", function(){
        yesaction();
        $('#popupdiv').slideUp();
    });
    $("#decline").bind('tap',function(){
        noaction();
        $('#popupdiv').slideUp();
    });
    console.log('QRY:  '+query);
}

function loading(binary){
    if(binary == true){
        $('#loadingmask').show();
    }else{
        $('#loadingmask').hide();
    }
}
function bindButtons(){
    $("#login").bind("tap", handleLogin);
    $("#register").bind("tap",handleRegister);
    $(".logout").bind("tap", logOut);
    $("#profilesPageButton").bind("tap", function(){getProfiles('profilespage');});
    $("#vehiclesPageButton").bind("tap",function(){getVehicles('vehiclespage');});
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
    $("#refreshVehicles").bind("tap", function(){getVehicles('vehiclespage')});
    $("#refreshgetTotalHours").bind("tap", getTotalHours);
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

    //This makes the new profile popup close when you tap out of it.
    $(document).on('touchstart', function (e) {
        var container = $(".popup");
        
        if (!container.is(e.target) && container.has(e.target).length === 0){
            container.slideUp();
        }
    });
    loading(false);
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*                                                      Auth functions          */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function handleLogin() {
    $("#submitButton").attr("disabled","disabled");
    loading(true);
    var email = $('#email').val();
    var password = $('#password').val();
    
    if(email!==""||password!==""){
        $.ajax({
            url: hosturl+"?action=login",
            data: {
                email: email,
                password: password,
            },
            type: 'POST',
            success: function(data){
                if(data.length == 20){
                    loading(false);
                    window.localStorage.setItem("seshstring", data);
                    console.log(window.localStorage.getItem("seshstring"));
                    $('#vehiclePageContainer').html("");
                    $("#profilePageContainer").html("");
                    getTotalHours();
                    $.mobile.changePage('#bastionPage');
                    if(doingTutorial){
                        tutorial('supervisor');
                    }
                } else {
                    loading(false);
                    errorMessage("Failure to login, please check the entered email and password.");
                }
            },error: function(data){
                loading(false);
                errorMessage("Error Connecting to Database: " + data);
            }
        });
    } else {
        loading(false);
        errorMessage("You must not leave the login or password fields empty.");
    }
}

function handleRegister() {
    //$("#registerSubmit").attr("disabled","disabled");
    var newEmail = $("#nEmail").val();
    var newName = $("#nfName").val();
    var newId = $("#nLNo").val();
    var newPass = $("#nPass").val();
    var repNewPass = $("#rNPass").val();
    
    if(newEmail!==""&&newName!==""&&newId!==""&&newPass!==""){
        if(newPass == repNewPass){
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
                    if(data == 'success'){
                        window.localStorage.setItem("seshstring", data);
                        console.log(window.localStorage.getItem("seshstring"));
                        $.mobile.changePage('#loginPage');
                        if(tutorial){
                            tutorial('login');
                        }
                    }  else if(data == "duplicate_email") {
                        errorMessage("The email you entered has already registered, please try an alternate. ");
                    } else {
                        errorMessage("Unkown error while trying to register. <br> Contact me at *****@***.com and tell me what happened. I'll sort it out :D.");
                    }
                },
                error: function (request, textStatus, errorThrown) {
                    errorMessage('Error connecting to database.'/* + request + textStatus+ errorThrown*/);
                }
            });
        } else {
            errorMessage("Passwords in both fields must match.");
        }
    } else {
        errorMessage("You must not leave any field empty.");
    }
}

function auth (data){
    if(data != 'lo'){
        return true;
    } else {
        return false;
    }
}

function logOut(){
    loading(true);
    $.ajax({
        url: hosturl+"?action=logout",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
        },
        error: function(data){
            console.log('error'+data);
        },
        dataType: 'json',
    }).done(function(){
        loading(false);
        window.localStorage.setItem("seshstring", '');
        $.mobile.changePage('#loginPage');
        errorMessage('Successfully logged out');
        $("#tripInfo2").html('');
        $('#selectVehicle').html("");
        $('#selectProfile').html("");   
        $('#vehiclePageContainer').html("");
        $('#profilePageContainer').html("");   
    });
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*                                                      Get Data Requests       */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

function getVehicles(purpose){
    loading(true);
    $.ajax({
        url: hosturl+"?action=getvehicles",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
            loading(false);
            narray = data;
            if(purpose=="trippage"){
                if(narray == null){
                    errorMessage('You must add a vehicle at the vehicles page page.  <div class="logout href="#vehiclesPage">Ok</div>')
                }else{
                    $('#selectVehicle').html("");                                // Clears the page so we dont get repeats
                    for(var e = 0; e < narray.length; e++) {
                        $('#selectVehicle').append($('<option>', {
                            value: e,
                            text: narray[e].alias,
                        }));
                    }
                }
            } else {
                if(narray == null){
                    errorMessage("You havn't added a Vehicle to drive yet, please add one now.")
                }else{
                    $('#vehiclePageContainer').html("");                          // Clears the page so we dont get repeats
                    for (var i = 0; i < narray.length; i++) {
                        template = "<div id='"+i+"'class='listObject'><h4>"+(i+1)+". "+narray[i].alias+"<br>"+/*"</h4><button class='popupCloseButton'>X</button><br><p>"+*/narray[i].licensenumber+"</p></div>";
                        $('#vehiclePageContainer').append(template);
                        console.log('array: '+narray);
                    }
                }
            }
        },
        error: function(data){
            loading(false);
            console.log("error"+data);
        },
        complete: function(data){
            loading(false);
        },
        dataType: 'json',
    });
}

function getProfiles(purpose){
    var profileArray = [];
    loading(true);
    $.ajax({
        url: hosturl+"?action=getprofiles",
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
            loading(false);
            narray = data;
            console.log('getProfiles Run');
            if(purpose=="trippage"){
                if(narray == null){
                    errorMessage('You must add a profile at the profiles page page.  <div class="logout href="#profilesPage">Ok</div>')
                } else {
                    console.log('trip page' + narray);
                    narray.forEach(function(el, ind){
                        $('#selectDriver').append($('<option>', {
                            value: ind,
                            text: el.alias,
                        }));
                    });
                }
            } else {
                if(narray == null){
                    errorMessage("You havn't added a Supervisor yet, please add one now.");
                } else {
                    if(doingTutorial){
                        $.mobile.changePage('#bastionPage');
                        tutorial('vehicle');
                    }
                    console.log('profilepage');
                    $('#profilePageContainer').html(""); // Clears the page
                    for (var o = 0; o < narray.length; o++) {
                        template = "<div id='"+o+"'class='listObject'><h4>"+(o+1)+". "+narray[o].alias+"<br>"+/*"</h4><button class='popupCloseButton'>X</button><br><p>"+*/narray[o].licensenumber+"</p></div>";
                        $('#profilePageContainer').append(template);
                    }
                }   
            }
        
        },
        error: function(data){
            loading(false);
            console.log("error"+data + profileArray);
        },
        complete: function(data){
            loading(false);
        },
        dataType: 'json',
    });
}

function getTripPage(){
    loading(true);
    $.ajax({
        url: hosturl+"?action=gettrips",
        dataType: 'JSON',
        data: {
            seshstring: window.localStorage.getItem("seshstring") ,
        },
        type: 'POST',
        success: function(data){
            loading(false);
            console.log(data);
            var narray = data;
            $('#tripListContainer').html(''); // Clears the page so we dont get repeats
            for(var e = 0; e < narray.length; e++) {
                narray[e].dbtimestart = narray[e].dbtimestart.slice(11, 19);
                narray[e].dbtimefinish = narray[e].dbtimefinish.slice(11, 19);
                $('#tripListContainer').append('<div class="listObject" id='+e+1+'><h4>'+msToTime(narray[e].dbtotaltime)+
                    '</h4><h6>'+narray[e].dbtimestart+' - '+narray[e].dbtimefinish+
                    '</h6><h5>'+narray[e].dblocstart[0]+' - '+narray[e].dblocfinish[0]+'</h5></div>');
            }
        },
        error: function(data){
            loading(false);
            console.log('Error Connecting to server');
        },
        complete: function(data){
            loading(false);
        },
    });
}

function getTotalHours(){
    $.ajax({
        url: hosturl+"?action=gettotalhours",
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
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*                                                      Add Data Requests       */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function addVehicle(name, licenseno){
    var newAlias = $("#newVehicleName").val();
    var newLicNo = $("#newVehicleNumberplate").val();
    if(newAlias != '' && newLicNo != ''){
        $.ajax({
            url: hosturl+"?action=newvehicle",
            data: {
                seshstring: window.localStorage.getItem("seshstring") ,
                alias: newAlias,
                licenseno: newLicNo,
            },
            type: 'POST',
            success: function(data){
                if(data == 'lo'){
                    errorMessage('Session has ended, logged out');
                    logOut();
                } else {
                    getVehicles();
                }
            },
            error: function(data){
                console.log('alias: '+ $("#newVehicleName").val()+ 'licensenumber'+ $("#newVehicleNumberplate").val());
                console.log("Error Adding New Vehicle: "+data);
            },
            dataType: 'json',
        });
    } else {
        errorMessage("Don't forget to fill in all the fields!")
    }
}
function addProfile(name, licenseno){
    var newAlias = $("#newAssiDriverName").val();
    var newLicNo = $("#newAssiDriverId").val();
    if(newAlias != '' && newLicNo != ''){
        if(newLicNo.length == 8 || newLicNo.length == 8){
            $.ajax({
                url: hosturl+"?action=newprofile",
                data: {
                    seshstring: window.localStorage.getItem("seshstring") ,
                    alias: newAlias,
                    licenseno: newLicNo,
                },
                type: 'POST',
                success: function(data){
                    if(data == 'lo'){
                        errorMessage('Session has ended, logged out');
                        logOut();
                    } else {
                        getVehicles();
                    }
                },
                error: function(data){
                    console.log('error'+data);
                },
                dataType: 'json',
            });
        } else {
            errorMessage('License Number must be 8 numbers long')
        }
    } else {
        errorMessage("Don't forget to fill in all the fields!")
    }
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*                                               Begin and Finish Trips         */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function initTrip(){
    function tripLoop(){
        tripLength = new Date()-timeStart;
        $("#tripTime").html(msToTime(tripLength));
    }
    loading(true);
    //Validation Variables
    //console.log('Initiating trip');
    var odoStart = $("#odoStart").val();
    console.log(odoStart , odoStart.length);
    odoStart = odoStart.split(',').join('');
    console.log(odoStart , odoStart.length);
    var supervisor = $("#selectDriver").find("option:selected").text();
    var vehicleUsed = $("#selectVehicle").find("option:selected").text();
    currentLocation = getGeoLocation();
    timeStart = new Date();
    //console.log("Initiating date time: " + timeStart);
    if(odoStart.indexOf('.') != -1){
        errorMessage('There was a "." in the odometer field somewhere which we cannot use.  Please remove it.');
    }else{
        if(odoStart.length < 11 && odoStart.length > 0  && parseInt(odoStart) > 0 && typeof(parseInt(odoStart))=='number'){
            waitForGeoLocationInit();
            function waitForGeoLocationInit(){
                if(currentLocation === undefined){
                    setTimeout( waitForGeoLocationInit,1500);
                    console.log('currentLocation is '+currentLocation+' so im going to wait 1.5s');
                    currentLocation = getGeoLocation();
                } else {
                    loading(false);
                    console.debug(currentLocation);
                    //console.log(odoStart, supervisor, vehicleUsed, timeStart, "position: ", currentLocation);
                    console.log('Saving required info to localwindow.localStorage, also trying to change page.');
                    window.localStorage.setItem("newTripODO", odoStart); //saves odoStart as newTripODO
                    window.localStorage.setItem("newTripS", supervisor);
                    window.localStorage.setItem("newTripV", vehicleUsed );
                    window.localStorage.setItem("newTripT", timeStart);
                    window.localStorage.setItem("newGeoLoc", JSON.stringify(currentLocation));
                    $.mobile.changePage('#progressTripPage');
                    $("#tripInfo").html("Odometer at Start: "+odoStart+"<br><br>Supervisor: "+ supervisor + "<br><br>Vehicle Used: "+vehicleUsed+"<br><br>");
                    tripInterval = setInterval(tripLoop, 1000);//1 second
                    tutorial('finalizetrip');
                }
            }
        } else {
            errorMessage('You must enter a value for the Odometer, it can be up to 11 characters.');
            loading(false);
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
    if(timeFinish !==null){
        timeFinish = new Date();
        timeStart = new Date(Date.parse(window.localStorage.getItem("newTripT")));
        totalTime = timeFinish.getTime() - Date.parse(timeStart);
        previousLocation = JSON.parse(window.localStorage.getItem('newGeoLoc'));
        currentLocation = getGeoLocation();
        waitForGeoLocationFinalize();
    }
    console.log('TOTAL TIME: '+totalTime);
    loading(true);
    function waitForGeoLocationFinalize(){
        if(currentLocation === undefined){
            setTimeout( waitForGeoLocationFinalize,1500);
            console.log('currentLocation is '+currentLocation+' so im going to wait 1.5s');
            currentLocation = getGeoLocation();
        } else {
            loading(false);
            console.debug(currentLocation);
            $("#tripInfo2").html(
                            "Odometer at Start: " + window.localStorage.getItem("newTripODO") +
                            "<br><br>" + "Odometer at Finish: <input type='text' id='odoFinish' placeholder='Odometer'>"+
                            "<br><br>" + "Supervisor: " + window.localStorage.getItem('newTripS') +
                            "<br><br>" + "Vehicle Used: " + window.localStorage.getItem('newTripV') + 
                            "<br><br>" + displayTime(timeStart) + " - " + displayTime(timeFinish) + 
                            "<br><br>" + "Starting Position: " + previousLocation[0]+ 
                            "<br><br>" + "Finishing Position: " + currentLocation[0]);
            $("#tripTime2").html(msToTime(totalTime));
            window.localStorage.setItem('newTripT', timeStart);
            window.localStorage.setItem('newTripTF', timeFinish);
        }
    }
}

function completeTrip(){
    odoStart = window.localStorage.getItem("newTripODO");
    odoFinish = $("#odoFinish").val();
    odoFinish = odoFinish.split(',').join('');
    if(odoFinish.indexOf('.') != -1){
        errorMessage('There was a "." in the odometer field somewhere which we can not use.  Please remove it.');
    }
    else{
        if(parseInt(odoFinish) <= parseInt(odoStart)){
            errorMessage('The odometer at the end of the trip must be greater than the odometer at the start of the trip.');
        } else{
            if(odoFinish.length < 11 && odoFinish.length > 0 && typeof(parseInt(odoFinish))=='number'){
                loading(true);
                assistantDriver = window.localStorage.getItem('newTripS');
                vehicleUsed = window.localStorage.getItem("newTripV");
                console.log(odoStart+odoFinish+timeStart+timeFinish+assistantDriver+vehicleUsed+previousLocation+currentLocation);
                $("#bastionPage").append('<div id="completedDisplay"><h2>Total Time: ' + msToTime(totalTime,'hm') + '</h2>' +
                                         '<p><b>Distance: </b>'+odoStart+'km - '+odoFinish+'km</p><br>'+
                                         '<p><b>Time: </b>'+displayTime(timeStart)+'-'+displayTime(timeFinish)+'</p><br>'+
                                         '<p><b>Supervisor: </b>'+window.localStorage.getItem('newTripS')+'</p><br>'+
                                         '<p><b>Vehicle: </b>'+window.localStorage.getItem('newTripV')+'</p><br>'+
                                         '<p><b>From: '+previousLocation[0]+'<br>  To: '+currentLocation[0]+'</p></b></div>');
                $.mobile.changePage('#bastionPage');    
                if(!doingTutorial){
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
                                dblocstart: JSON.stringify(previousLocation),
                                dblocfinish: JSON.stringify(currentLocation),
                                dbtriplength: totalTime},
                        success: function(data){
                            $("#bastionPage").append('<div id="letter"></div>');
                            $("#letter").append('<div id="flap"></div>').css({display: 'block'}).delay(7500).animate({left: 1000}, 1000).delay(1000).queue(function() { $(this).remove(); });
                            $("#completedDisplay").css({display: 'block'}).delay(7000).toggle('fold').queue(function() { $(this).remove(); });
                            $("#odoStart").val("");
                            console.log("Successfully added trip");
                            loading(false);
                        },
                        error: function(data){
                            $('#completedDisplay').append('<div id="resendPageButton" class="button">Retry</div>')
                            errorMessage('Failure to send');
                        }
                    });
                } else {
                    tutorial('finish');
                }
            } else {
                errorMessage('You must enter a value for the Odometer, it can be up to 11 characters.');
                loading(false);
            }
            getTotalHours();
        }
    }
}
