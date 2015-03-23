## jComplete
grammar autocomplete jQuery extension

#How to use?

$("#myCustomElement").jComplete({
        rules: ['Rule = "IF" This "THEN" That', 
						  'This = Event | Event "AND" This', 
						  'Event = "EmailReceived" | "HDDload" ">" Digit Digit "%"', 
						  'Digit =  "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"',
						  'That =  Action | Action "," That', 
						  'Action = "Popup" | "SendEmail" | "Shutdown" | "Delete" | "Start"'],
				start: "Rule"});
				
	feel free to contact me if you are interestet in collaborate developing.
