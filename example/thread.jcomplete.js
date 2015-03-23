/**
* jComplete: grammar autocomplete framework for JavaScript - http://jComplete.org
* Apache License http://www.apache.org/licenses/
* @author Martin Seidel
*/

var resultTree = new Array();
var findRoute = new Array();
var keywords = new Array();
var debug = false;

self.addEventListener('message', function(e){
	//Rekursive Funktion ausführen
	//Starwort setzen
	resultTree = [e.data.rules[0][0]]
	//Letztes element wenn leer löschen
	if(e.data.input[e.data.input.length - 1] == ""){
		e.data.input.pop();
	}
	debug = e.data.debug;

	if(e.data.input.length > 0){
		var result = fitInput(e.data.rules, e.data.input, resultTree, 0);
	}else{
		self.postMessage(findExtensions(e.data.rules, resultTree[0][1]));
	}
	self.postMessage(keywords);
}, false);

/*
@param rules				=	(array)	Gesamtes Regelalphabet
@param currentRule			=	(int)	Id der aktuell abzuarbeitenden Regel
@param currentPossition		=	(int)	Id der aktuelles Possition in der Regel
@param input				=	(array)	alle eingaben die vom User gemacht wurden
@return		array(errorCode, array(Eingabevorschlägen))
*/
var mindepth = 0;
var lockdepth = new Array();
function fitInput(rules, input, subtree, depthcc){

	if(input.length > 0){
		//Überprüfen ob Endwort
		if(subtree[0][0] == 2){
			//Checken ob input wert ein Teilstring ist
			var ts = input[0].replace(subtree[0][1], "");
			if(ts != input[0]){
				input[0] = input[0].replace(ts, "");
			}else{
				ts = "";
			}
			if(subtree[0][1] == input[0]){
				if(ts == ""){
					input.shift();
				}else{
					input[0] = ts;
				}
				if(input.length == 0){
					input = [500];
				}
				return [true, [input], subtree];
			}else{
				if(input.length == 0){
					input = [500];
				}
				return [false, [input], subtree]
			}
		}else{
			//regeln im Teilbaum ersetzen
			ret_array = new Array();
			for(var i = 0; i < rules.length; i++){
				if(rules[i][0][1] == subtree[0][1]){
					subtree.push(new Array());
					//alle Untermöglichkeiten eintragen
					r_input = [input.copy()];
					//Jedes Regelelement
					for(var j = 1; j < rules[i].length; j++){
						newRInput = new Array();
						subtree[subtree.length - 1].push(rules[i][j].copy());
						//Für jeden Input in der Regel
						for(var l = 0; l < r_input.length; l++){
							var result = fitInput(rules, r_input[l].copy(), [rules[i][j].copy()], (depthcc + 1));	
							if(result[0]){
								//Alle eingabealphabete durchlaufen
								for(var b = 0; b < result[1].length; b++){
									if(result[1][b][0] == 500){
										if(rules[i][j+1]){
											if(rules[i][j+1][0] == 2){
												if(!isinarray(keywords, rules[i][j+1][1])){
													keywords.push(rules[i][j+1][1]);
												}
													if((j+1) == (rules[i].length - 1)){
														result[1][b][0] = "";
													}
												continue;
											}else{
												findExtensions(rules, rules[i][j+1][1]);
												result[1][b][0] = "";
												continue;
											}
										}else{
											result[1][b][0] = "500";
										}
									}
									newRInput.push(result[1][b].copy());
								}
								subtree[subtree.length - 1][j - 1].push(result[2].copy());
							}
						}
						//Alle Inputs abgearbeitet
						r_input = newRInput.copy();
					}
					ret_array = ret_array.concat(r_input.copy());
				}
			}
			return [true, ret_array.copy(), subtree.copy()];
		}
	}else{
		if(input.length == 0){
			return [true, [[]], subtree];
		}else{
			return [false, [[]], subtree];
		}
	}
}


//Findet alle Eingabemöglichkeiten für den neuen String
function findExtensions(rules, keyWord){
	for(var i = 0; i < rules.length; i++){
		if(rules[i][0][1] == keyWord){
			var fe = false;
			for(var k = 0; k < keywords.length; k++){
				if(keywords[k] == rules[i][1][1]){
					fe = true;
				}
			}
			if(!fe){
				if(rules[i][1][0] == 2){
					keywords.push(rules[i][1][1]);
				}else{
					findExtensions(rules, rules[i][1][1]);
				}
			}
		}
	}
}

function isinarray(arr, val){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == val){
			return true;
		}
	}
}

Array.prototype.copy = function()
{
    return this.slice();
}