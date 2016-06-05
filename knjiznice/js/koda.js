
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

    //console.log("REGISTRACIJA:");

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
				$("#error2").html("");
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
    var recept = document.getElementById("inRecept").value;

    if(ehrId && datum && sTlak && dTlak && temp && teza && sladkor) {

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
		    "vital_signs/blood_pressure/any_event/diastolic": dTlak,
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
                document.getElementById("error4").innerHTML = "Ime: "+party.firstNames+" | Priimek: "+party.lastNames;

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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].systolic.toFixed(2)+"</td><td id='unit'>"+res[i].unit+"</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
				    	    narisi();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].diastolic.toFixed(2)+"</td><td id='unit'>"+res[i].unit+"</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
				    	    narisi();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].height.toFixed(2)+"</td><td id='unit'>cm</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
				    	    narisi();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].temperature.toFixed(2)+"</td><td id='unit'>°C</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
				    	    narisi();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].weight.toFixed(2)+"</td><td id='unit'>kg</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
				    	    }
				    	    else {
				    	    	document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + "<tr><td>No records</td></tr>"
				    	    }
				    	    narisi();
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

function getPovprecje() {
	var tab = document.getElementsByClassName("data");
	if(tab) {
		var sum = 0;
		for(var i = 0; i < tab.length; i++) {
			sum += parseFloat(tab[i].innerHTML);
		}
		sum = sum / tab.length;
	}
	return "<strong>Povprečje:</strong> "+sum.toFixed(2)+" "+document.getElementById("unit").innerHTML;
}

var chartEl,chart,chartData,chartTitle;
chartTitle = "Ni izbrane meritve!";

$(document).ready(function(){
	chartEl = $("#chart");
	
	chartData = {
	    labels: [],
	    datasets: [
	        {
	            label: chartTitle,
	            fill: true,
	            lineTension: 0.4,
	            backgroundColor: "rgba(75,192,192,0.4)",
	            borderColor: "rgba(75,192,192,1)",
	            borderCapStyle: 'round',
	            borderDash: [],
	            borderDashOffset: 0.0,
	            borderJoinStyle: 'miter',
	            pointBorderColor: "rgba(75,192,192,1)",
	            pointBackgroundColor: "#fff",
	            pointBorderWidth: 1,
	            pointHoverRadius: 5,
	            pointHoverBackgroundColor: "rgba(75,192,192,1)",
	            pointHoverBorderColor: "rgba(220,220,220,1)",
	            pointHoverBorderWidth: 2,
	            pointRadius: 4,
	            pointHitRadius: 10,
	            data: [],
	        }
	    ]
	};
	
	chart = new Chart(chartEl, {
	    type: 'line',
	    data: chartData,
	    options: {
	    	scales: {
	            xAxes: [{
	                display: false
	            }]
	        }
	    }
	});
});


function narisi() {
	var data_values = $(".data");
	var time_values = $(".time");
	
	var labels = [];
	var values = [];
	for (var i = 0; i < data_values.length; i++) {
		labels.push(time_values.eq(i).html());
		values.push(data_values.eq(i).html());
	}
	
	var selected = "Ni izbrane meritve!";
	var items = $("#formRadio input[type='radio']");
	for (var i in items) {
		if ($(items).eq(i).is(":checked")) {
			selected = $(items).eq(i).parent().text();
			break;
		}
	}
	
	chartTitle = selected;
	
	chartData.labels = labels;
	chartData.datasets[0].data = values;
	chartData.datasets[0].label = chartTitle;
	
	chart.update();
}

function klikNaDropMenu() {
	console.log("KLIK!")
	console.log(document.getElementById("dropMenu").value);
	document.getElementById("inEHRID3").value = document.getElementById("dropMenu").value;
}

function klikNaGumbGeneriraj() {
	generirajPaciente("1");
	generirajPaciente("2");
	generirajPaciente("3");
	
	setTimeout(function() {
		document.getElementById("error7").innerHTML = "Usprešno generiranje pacientov!";
		document.getElementById("error7").style.color = "green";
		
		var menu = document.getElementById("dropMenu");
		menu.innerHTML = "<option>"+document.getElementById("auto1").innerHTML+"</option>";
		menu.innerHTML += "<option>"+document.getElementById("auto2").innerHTML+"</option>";
		menu.innerHTML += "<option>"+document.getElementById("auto3").innerHTML+"</option>";
	}, 1850);
}


function startPage(input) {
	var table = document.getElementById("tableEHR");
    switch (input) {
    	case '0':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong id='uniq'>Sistolični krvni tlak:</strong></th><th><strong>Enota:</strong></th></tr>";
    		break;
    	case '1':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong id='uniq'>Diastolični krvni tlak:</strong></th><th><strong>Enota:</strong></th></tr>";
    		break;
    	case '2':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong id='uniq'>Telesna višina:</strong></th><th><strong>Enota:</strong></th></tr>";
    		break;
    	case '3':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong id='uniq'>Telesna temperatura:</strong></th><th><strong>Enota:</strong></th></tr>";
    		break;
    	case '4':
    		table.innerHTML = "<tr><th><strong>Datum:</strong></th><th><strong id='uniq'>Telesna teža:</strong></th><th><strong>Enota:</strong></th></tr>";
    		break;
    	default:
    		return;
    }
}

function getRadioButton() {
	var ids = ["radio0", "radio1", "radio2", "radio3", "radio4"];
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
function generirajPaciente(stPacienta) {
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
	  	ime = "Marilyn";
	  	priimek = "Monroe";
	  	datumRojstva = "1926-6-1";
	  	break;
	  default:
	  	break;
	}

	var sessionId = getSessionId();

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
	            dateOfBirth: datumRojstva,
	            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
	        };
	        $.ajax({
	            url: baseUrl + "/demographics/party",
	            type: 'POST',
	            contentType: 'application/json',
	            data: JSON.stringify(partyData),
	            success: function (party) {
	                if (party.action == 'CREATE') {
	                    $("#auto" + stPacienta).html(ehrId);
	                }
	            },
	            error: function(err) {
	            }
	        });
	    }
	});
	
	setTimeout(function() {
		generirajPregled(stPacienta);
	}, 1000);

}

function generirajPregled(stPacienta) {
	var sessionId = getSessionId();
	
	var datum = new Array(5);
	var sTlak = new Array(5);
	var dTlak = new Array(5);
	var visina = new Array(5);
	var temp = new Array(5);
	var teza = new Array(5);
	var merilec = new Array(5);
	var ehrId = document.getElementById("auto"+stPacienta).innerHTML;

	
	switch (stPacienta) {
		case '1':
			datum[0] = "2000-1-1T12:32";
			datum[1] = "2000-2-15T11:22";
			datum[2] = "2000-4-19T11:20";
			datum[3] = "2001-2-3T1:13";
			datum[4] = "2080-11-27T5:50";
			sTlak[0] = 90;
			sTlak[1] = 111;
			sTlak[2] = 88;
			sTlak[3] = 120;
			sTlak[4] = 300;
			dTlak[0] = 70;
			dTlak[1] = 120;
			dTlak[2] = 79;
			dTlak[3] = 129;
			dTlak[4] = 250;
			visina[0] = 175;
			visina[1] = 176;
			visina[2] = 175;
			visina[3] = 177;
			visina[4] = 174;
			temp[0] = 37.2;
			temp[1] = 37.3;
			temp[2] = 38.9;
			temp[3] = 42.9;
			temp[4] = 35;
			teza[0] = 80;
			teza[1] = 82;
			teza[2] = 110;
			teza[3] = 88;
			teza[4] = 75;
			break;
		case '2':
			datum[0] = "2005-1-1T12:32";
			datum[1] = "2006-2-15T11:22";
			datum[2] = "2007-4-19T11:20";
			datum[3] = "2008-2-3T1:13";
			datum[4] = "2009-11-27T5:50";
			sTlak[0] = 80;
			sTlak[1] = 101;
			sTlak[2] = 98;
			sTlak[3] = 100;
			sTlak[4] = 250;
			dTlak[0] = 80;
			dTlak[1] = 220;
			dTlak[2] = 39;
			dTlak[3] = 129;
			dTlak[4] = 150;
			visina[0] = 195;
			visina[1] = 196;
			visina[2] = 195;
			visina[3] = 197;
			visina[4] = 194;
			temp[0] = 37.2;
			temp[1] = 37.3;
			temp[2] = 38.9;
			temp[3] = 42.9;
			temp[4] = 35;
			teza[0] = 80;
			teza[1] = 82;
			teza[2] = 110;
			teza[3] = 88;
			teza[4] = 75;
			break;
		case '3':
			datum[0] = "2000-1-1T12:32";
			datum[1] = "2000-2-15T11:22";
			datum[2] = "2000-4-19T11:20";
			datum[3] = "2001-2-3T1:13";
			datum[4] = "2080-11-27T5:50";
			sTlak[0] = 90;
			sTlak[1] = 111;
			sTlak[2] = 88;
			sTlak[3] = 120;
			sTlak[4] = 300;
			dTlak[0] = 70;
			dTlak[1] = 120;
			dTlak[2] = 79;
			dTlak[3] = 129;
			dTlak[4] = 250;
			visina[0] = 175;
			visina[1] = 176;
			visina[2] = 175;
			visina[3] = 177;
			visina[4] = 174;
			temp[0] = 37.2;
			temp[1] = 37.3;
			temp[2] = 38.9;
			temp[3] = 42.9;
			temp[4] = 35;
			teza[0] = 180;
			teza[1] = 182;
			teza[2] = 110;
			teza[3] = 188;
			teza[4] = 175;
			break;
		default:
			break;
	}
	
	for(var i = 0; i < 5; i++) {
		 dodajPregled(datum[i], sTlak[i], dTlak[i], visina[i], temp[i], teza[i], sessionId, ehrId);
	}	
	
}

function dodajPregled(datum, sTlak, dTlak, visina, temp, teza, sessionId, ehrId) {
	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	
	var podatki = {
	    "ctx/language": "en",
	    "ctx/territory": "SI",
	    "ctx/time": datum,
	    "vital_signs/height_length/any_event/body_height_length": visina,
	    "vital_signs/body_weight/any_event/body_weight": teza,
	   	"vital_signs/body_temperature/any_event/temperature|magnitude": temp,
	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
	    "vital_signs/blood_pressure/any_event/systolic": sTlak,
	    "vital_signs/blood_pressure/any_event/diastolic": dTlak,
	};
	
	var parametriZahteve = {
	    ehrId: ehrId,
	    templateId: 'Vital Signs',
	    format: 'FLAT',
	    committer: "Bob Marley"
	};
	
	$.ajax({
	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
	    type: 'POST',
	    contentType: 'application/json',
	    data: JSON.stringify(podatki),
	    async: false // !! nastavimo da je sinhrono
	});
		
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

function klikNaAuto1() {
	document.getElementById("error5").innerHTML = "Ehr id1 copiran v <a href='https://en.wikipedia.org/wiki/Clipboard_%28computing%29' target='_blank'>'clipboard.'</a>";
	copyToClipboard(document.getElementById("auto1"));
}

function klikNaAuto2() {
	document.getElementById("error5").innerHTML = "Ehr id2 copiran v <a href='https://en.wikipedia.org/wiki/Clipboard_%28computing%29' target='_blank'>'clipboard.'</a>";
	copyToClipboard(document.getElementById("auto2"));
}

function klikNaAuto3() {
	document.getElementById("error5").innerHTML = "Ehr id3 copiran v <a href='https://en.wikipedia.org/wiki/Clipboard_%28computing%29' target='_blank'>'clipboard.'</a>";
	copyToClipboard(document.getElementById("auto3"));
}

//baje nedela na Safari brskalniku[?!?]
function copyToClipboard(elem) {
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    var succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
    	document.getElementById("error5").innerHTML = "";
        succeed = false;
    }
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }
    if (isInput) {
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        target.textContent = "";
    }
    return succeed;
}

//---------------------------

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        document.getElementById("geo").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
	//console.log(position.coords.latitude);
	//console.log(position.coords.longitude);
	
	var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	map.panTo(myLatlng);
	
	var request = {
		location: myLatlng,
		radius: '10000',
		types: ['pharmacy']
	};
	
	infowindow = new google.maps.InfoWindow();
	
	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);
	
}


function klikNaGumbLokacija() {
	
	console.log("LOKACIJA");
	
	getLocation();
	
}

//---------------------------

var map;
var service;
var infowindow;

function initialize(init) {
	var ljubljana = new google.maps.LatLng(46.056947,14.505751);
	
	map = new google.maps.Map(document.getElementById(init), {
		center: ljubljana,
		zoom: 15
	});
	
	var request = {
		location: ljubljana,
		radius: '35000',
		types: ['pharmacy']
	};
	
	infowindow = new google.maps.InfoWindow();
	
	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
    	infowindow.open(map, this);
	});
}


function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
			var place = results[i];
			createMarker(results[i]);
		}
	}
}