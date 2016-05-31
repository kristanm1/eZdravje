
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function klikNaGumbRegistracija() {
    var sessionId = getSessionId();
    var ime = document.getElementById("inIme").value;
    var priimek = document.getElementById("inPriimek").value;
    var rojstvo = document.getElementById("inRojstvo").value;
    
    console.log("REGISTRACIJA:");
    
    if(ime && priimek && rojstvo) {
        //console.log(ime);
        //console.log(priimek);
        //console.log(rojstvo);
        
        document.getElementById("error1").innerHTML = "";
        document.getElementById("error1").style.color = "green";
        
        $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: rojstvo,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    document.getElementById("error1").innerHTML = "";
                            document.getElementById("error1").style.color = "green";
		                    $("#error1").html("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#preberiEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		                document.getElementById("error1").style.color = "red";
		            	$("#error1").html(JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		});
    }
    else {
        document.getElementById("error1").innerHTML = "Vnesite vse podatke.";
        document.getElementById("error1").style.color = "red";
    }
    
}

function klikNaGumbPoisci() {
    var sessionId = getSessionId();
    var ehrid = document.getElementById("inEHRID1").value;
    
    //console.log("POISCI:")
    
    if(ehrid) {
        //console.log(ehrid);
        
        $.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrid + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				document.getElementById("outIme").innerHTML = "";
				document.getElementById("outIme").innerHTML = party.firstNames;
				document.getElementById("outPriimek").innerHTML = "";
				document.getElementById("outPriimek").innerHTML = party.lastNames;
				document.getElementById("outRojstvo").innerHTML = "";
				document.getElementById("outRojstvo").innerHTML = party.dateOfBirth;
			},
			error: function(err) {
			    document.getElementById("error2").style.color = "red";
				$("#error2").html("Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
			}
		});
        
    }
    else {
        document.getElementById("error2").innerHTML = "Vnesite vse podatke.";
        document.getElementById("error2").style.color = "red";
    }
    
}

function klikNaGumbDodajZapis() {
    var sessionId = getSessionId();
    var ehrId = document.getElementById("inEHRID2").value;
    var datum = document.getElementById("inDatum").value;
    var sTlak = document.getElementById("inSTlak").value;
    var dTlak = document.getElementById("inDTlak").value;
    var temp = document.getElementById("inTemperatura").value;
    var teza = document.getElementById("inTeza").value;
    var sladkor = document.getElementById("inSladkor").value;
    var merilec = document.getElementById("inMerilec").value;
    
    console.log("DODAJ ZAPIS:")
    
    if(ehrId && datum && sTlak && dTlak && temp && teza && sladkor) {
        
        console.log(ehrId);
        console.log(datum);
        console.log(sTlak);
        console.log(dTlak);
        console.log(temp);
        console.log(teza);
        console.log(sladkor);
        console.log(merilec);
        
        
        $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datum,
		    "vital_signs/height_length/any_event/body_height_length": sladkor,
		    "vital_signs/body_weight/any_event/body_weight": teza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": temp,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": dTlak
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        document.getElementById("error3").innerHTML = "";
		        document.getElementById("error3").style.color = "green";
		        document.getElementById("error3").innerHTML = res.meta.href;
		    },
		    error: function(err) {
		    	$("#error3").html(JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
    }
    else {
        document.getElementById("error3").innerHTML = "Vnesite vse podatke.";
        document.getElementById("error3").style.color = "red";
    }
    
}

function klikNaGumbPoisciZapis() {
    var sessionId = getSessionId();
    var ehrId = document.getElementById("inEHRID3").value;
    var tip = getRadioButton();
    
    startPage(getRadioButton());
    
    //console.log("POISCIZAPIS:");
    
    if(ehrId) {
        //console.log(ehrId);
        document.getElementById("error4").innerHTML = "";
        document.getElementById("error4").style.color = "green";
        
        startPage();
        
        $.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				document.getElementById("error4").innerHTML = "";
				document.getElementById("error4").style.color = "green";
                document.getElementById("error4").innerHTML = "Ime: "+party.firstNames+" --- Priimek: "+party.lastNames;

				var tmp = getRadioButton();
				
				if(tmp == 0) {
					$.ajax({
	  				    url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
				    	    var result = "";
				    	    if(res.length > 0) {
				    	        for(var i in res) {
				    	            result += "<tr><td id='time'>"+res[i].time+"</td><td id='data'>"+res[i].systolic+" "+res[i].unit+"</td></tr>"
				    	            console.log(res[i]);
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
					    },
					    error: function() {
					    	document.getElementById("error4").innerHTML = "Prišlo je do napake.";
	                        document.getElementById("error4").style.color = "red";
					    }
					});
				}
				
				if(tmp == 1) {
					$.ajax({
	  				    url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
				    	    var result = "";
				    	    if(res.length > 0) {
				    	        for(var i in res) {
				    	            result += "<tr><td>"+res[i].time+"</td><td>"+res[i].diastolic+" "+res[i].unit+"</td></tr>"
				    	            console.log(res[i]);
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
					    },
					    error: function() {
					    	document.getElementById("error4").innerHTML = "Prišlo je do napake.";
	                        document.getElementById("error4").style.color = "red";
					    }
					});
				}
				
				if(tmp == 2) {
					$.ajax({
	  				    url: baseUrl + "/view/" + ehrId + "/" + "height",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
				    	    var result = "";
				    	    if(res.length > 0) {
				    	        for(var i in res) {
				    	            result += "<tr><td>"+res[i].time+"</td><td>"+res[i].height+" mmol/l</td></tr>"
				    	            console.log(res[i]);
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
					    },
					    error: function() {
					    	document.getElementById("error4").innerHTML = "Prišlo je do napake.";
	                        document.getElementById("error4").style.color = "red";
					    }
					});
				}

				if(tmp == 3) {
					$.ajax({
	  				    url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
				    	    var result = "";
				    	    if(res.length > 0) {
				    	        for(var i in res) {
				    	            result += "<tr><td>"+res[i].time+"</td><td>"+res[i].temperature+" °C </td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
					    },
					    error: function() {
					    	document.getElementById("error4").innerHTML = "Prišlo je do napake.";
	                        document.getElementById("error4").style.color = "red";
					    }
					});
				}
				
				if(tmp == 4) {
					$.ajax({
	  				    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
				    	    var result = "";
				    	    if(res.length > 0) {
				    	        for(var i in res) {
				    	            result += "<tr><td>"+res[i].time+"</td><td>"+res[i].weight+" kg </td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	    }
					    },
					    error: function() {
					    	document.getElementById("error4").innerHTML = "Prišlo je do napake.";
	                        document.getElementById("error4").style.color = "red";
					    }
					});
				}

	    	},
	    	error: function(err) {
                document.getElementById("error4").innerHTML = JSON.parse(err.responseText).userMessage+"!";
	    	}
		});
        
    }
    else {
        document.getElementById("error4").innerHTML = "Vnesite vse podatke.";
        document.getElementById("error4").style.color = "red";
    }
    
}

function klikNaGumbGeneriraj() {
	document.getElementById("auto1").innerHTML = generirajPodatke("1");
	document.getElementById("auto2").innerHTML = generirajPodatke("1");
	document.getElementById("auto3").innerHTML = generirajPodatke("1");
}


function startPage(input) {
	var table = document.getElementById("tableEHR");
    switch (input) {
    	case '0':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong>Sistolični krvni tlak:</strong></th></tr>";
    		break;
    	case '1':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong>Diastolični krvni tlak:</strong></th></tr>";
    		break;
    	case '2':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong>Krvni sladkor:</strong></th></tr>";
    		break;
    	case '3':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong>Telesna temperatura:</strong></th></tr>";
    		break;
    	case '4':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong>Telesna teža:</strong></th></tr>";
    		break;
    	default:
    		return;
    }
}

function getRadioButton() {
	var ids = ["radio0", "radio1", "radio2", "radio3", "radio4", "radio5"];
	for(var i in ids) {
		if(document.getElementById(ids[i]).checked) {
			return i;
		}
	}
	return -1;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  ehrId = "";

  var ime;
  var priimek;
  var datumRojstva;
  
  switch (stPacienta) {
  	case '1':
  		ime = "Mojca"
  		priimek = "Pokraculja";
  		datumRojstva = "1889-4-30";
  		break;
  	case '2':
  		ime = "Josip";
  		priimek = "Broz";
  		datumRojstva = "1892-5-7";
  		break;
  	case '3':
  		ime = "";
  		priimek = "";
  		datumRojstva = "";
  		break;
  	default:
  		// code
  }

  return ehrId;
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
