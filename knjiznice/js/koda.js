
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

    //console.log("DODAJ ZAPIS:")

    if(ehrId && datum && sTlak && dTlak && temp && teza && sladkor) {

        //console.log(ehrId);
        //console.log(datum);
        //console.log(sTlak);
        //console.log(dTlak);
        //console.log(temp);
        //console.log(teza);
        //console.log(sladkor);
        //console.log(merilec);


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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].systolic+"</td><td id='unit'>"+res[i].unit+"</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].diastolic+"</td><td id='unit'>"+res[i].unit+"</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].height+"</td><td id='unit'>cm</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].temperature+"</td><td id='unit'>°C</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
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
				    	            result += "<tr><td class='time'>"+res[i].time+"</td><td class='data'>"+res[i].weight+"</td><td id='unit'>kg</td></tr>"
				    	        }
				    	        document.getElementById("tableEHR").innerHTML = document.getElementById("tableEHR").innerHTML + result;
				    	        document.getElementById("povprecje").innerHTML = getPovprecje();
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

function getPovprecje() {
	var tab = document.getElementsByClassName("data");
	if(tab) {
		var sum = 0;
		for(var i = 0; i < tab.length; i++) {
			sum += parseInt(tab[i].innerHTML);
		}
		sum = sum / tab.length;
	}
	return "<strong>Povprečje:</strong> "+sum+" "+document.getElementById("unit").innerHTML;
}


function klikNaGumbNarisi() {
	var tableD = document.getElementsByClassName("data");
	var tableT = document.getElementsByClassName("time");
	if(tableD.length != 0) {
		document.getElementById("error6").innerHTML = "";
		document.getElementById("graf").innerHTML = "";
		var arrData = new Array(tableD.length);

		for(var i = 0; i < tableD.length; i++) {
			var d = tableD[i].innerHTML;
			var t = tableT[i].innerHTML;
			t = t.split("T")[0];
			arrData[i] = [t, parseInt(d)];
		}

		var margin = {top: 20, right: 20, bottom: 30, left: 50},
		    width = 960 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

		var parseDate = d3.time.format("%Y-%m-%d").parse;


		var x = d3.time.scale()
		    .range([0, width])

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var line = d3.svg.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.close); });

		var svg = d3.select("#graf").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var data = arrData.map(function(d) {
		  return {
		     date: parseDate(d[0]),
		     close: d[1]
		  };

		});

		x.domain(d3.extent(data, function(d) { return d.date; }));
		y.domain(d3.extent(data, function(d) { return d.close; }));

		svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

		svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text(document.getElementById("uniq").innerHTML.split(":")[0]+" ("+document.getElementById("unit").innerHTML+")");

		svg.append("path")
		  .datum(data)
		  .attr("class", "line")
		  .attr("d", line);
	}
	else {
		document.getElementById("error6").innerHTML = "Prvo je potrebno 'Poizvedovanje z EHR ID po zapisih'".bold();
		document.getElementById("error6").style.color = "red";
	}
}

function klikNaGumbGeneriraj() {
	generirajPaciente("1");
	generirajPaciente("2");
	generirajPaciente("3");
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
	                    document.getElementById("error5").innerHTML = "";
                        document.getElementById("error5").style.color = "green";
	                    $("#auto" + stPacienta).html(ehrId);
	                    $("#error5").html("");
	                }
	            },
	            error: function(err) {
	                document.getElementById("error5").style.color = "red";
	            	$("#error5").html(JSON.parse(err.responseText).userMessage + "'!");
	            }
	        });
	    }
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