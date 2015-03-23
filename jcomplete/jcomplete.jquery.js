/**
* jComplete: grammar autocomplete framework for JavaScript - http://jComplete.org
* Apache License http://www.apache.org/licenses/
* @author Martin Seidel
*/

(function ($) {
  var pluginname = "jComplete";
  
 
  $.fn.jComplete = function(options){
    //Defaultwerte
    var settings = {
                      'rules'  :  new Array(),
					  'debug'  : false
    };
    //Option binding
    var opt = $.extend(settings, options);
    //Element Restore
    var el = get_jComplete(this);
		el.debug = opt.debug;
	el.parseRules(opt.rules);
	//Eventsettings
	$(this).bind("focus click keyup", function(e){
		if(e.keyCode && e.keyCode == 13){
			el.completeInput();
		}
		el.processInput(this.value);
		this.focus();
	});
	
	$(this).bind("blur", function(){
		el.cancelInput();
	});
	
  };
	

  //*** Functions .......
  //### Element ermitteln
  function get_jComplete(cid) {
    //Element aus der Datenbasis suchen
    for(var i = 0; i < jComplete.length; i++){
      if(jComplete[i].id == cid){
        return jComplete[i];
      }
    }
    //Wenn kein Element gefunden wurde neues Anlegen
    jComplete.push(new class_complete_data(cid));
    return jComplete[jComplete.length - 1];
  }
  
  //### Dataclasses
  function class_complete_data(id){
    //Id
    this.id = id;
    this.parsed_rules = new Array();
    this.workerArray = new Array();
	this.debug = false;
	this.nextInput = new Array();
	this.hideInputId = "hipid" + Math.round((Math.random() * 100000000));
  
    //Initialisierungsfunktion
    this.setup = function(){
		$(this.id).wrap('<div style="position:relative;"></div>')
		$(this.id).parent().prepend('<input type="text" value="" style="color:#888888;" id="'+this.hideInputId+'" /><div class="jcompleteresults" id="s'+this.hideInputId+'"></div>');
		$(this.id).css({position: 'absolute', left: "0px", top: "0px"});
      return true;
    }
	
	this.parseRules =  function parse_rules(rules){
	for(var i = 0; i < rules.length; i++){
			cx = rules[i].toLowerCase().split("=");
			//Logik Statement auswerten
			cl = cx[1].split("|");
			for(k = 0; k < cl.length; k++){
				//Konkatinationen auswerten
				ck = cl[k].split(' ');
				this.parsed_rules.push([[0,cx[0].trim()]]);
				
				for(n = 0; n < ck.length; n++){
					if(ck[n].trim() != "") {
						if(ck[n][0] != '"'){
								this.parsed_rules[this.parsed_rules.length-1].push([1, ck[n].trim()]);
						}else{
								cv = ck[n].trim();
								cv = cv.replace(/"/g, '');
								this.parsed_rules[this.parsed_rules.length-1].push([2, cv]);
						}
					}
				}
			}
		}
	 }
	
	this.addItem = function(){
		that = this;
		$("#s" + that.hideInputId + " div").bind("click", function(e){
			$(that.id).val($(that.id).val() + $(this).html() + " ");
			that.processInput($(that.id).val());
			that.id.focus();
		});
	}
	
	this.processInput = function processInput(val){
		UserValue = val.toLowerCase().split(" ");
		that = this;
		this.workerArray.push(new Worker('thread.jcomplete.js'));
		this.workerArray[this.workerArray.length-1].addEventListener('message', function(e){
			if(e.data){
				that.nextInput = e.data;
				if(e.data.length == 1){
					$("#" + that.hideInputId).val($(that.id).val() + e.data[0]);
					$("#s" + that.hideInputId).html("");
				}else{
					var output = "";
					for(var i = 0; i < e.data.length; i++){
						output += '<div>'+e.data[i]+'</div>';
					}
					$("#s" + that.hideInputId).html(output);
					that.addItem();
				}
				this.terminate();
			}
		}, false);
		
		this.workerArray[this.workerArray.length-1].postMessage({'rules': this.parsed_rules, 'input': UserValue, 'debug': this.debug});
	}
	
	this.completeInput = function(){
		$(this.id).val($("#" + that.hideInputId).val() + " ");
	}
	
	this.cancelInput = function(){
		$("#" + this.hideInputId).val("");
	}
	
    //initialisieren;
    return this.setup();
  }
  
  //*** Dataobjects
  var jComplete = new Array();
  
}(window.jQuery || window.$));